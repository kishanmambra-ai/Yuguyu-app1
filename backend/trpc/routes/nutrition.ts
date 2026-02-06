import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { db } from "../../db";
import { meals, foodEntries, nutritionGoals, waterLogs, favoriteFoods } from "../../db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

const getSecretKey = () => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(JWT_SECRET);
};

async function getUserIdFromToken(token: string): Promise<string> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub) throw new Error("Invalid token");
    return payload.sub as string;
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export const nutritionRouter = createTRPCRouter({
  createMeal: publicProcedure
    .input(
      z.object({
        token: z.string(),
        name: z.string().min(1),
        mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        date: z.string(),
        notes: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const [meal] = await db
        .insert(meals)
        .values({
          userId,
          name: input.name,
          mealType: input.mealType,
          date: input.date,
          notes: input.notes,
          imageUrl: input.imageUrl,
        })
        .returning();

      return meal;
    }),

  addFoodEntry: publicProcedure
    .input(
      z.object({
        token: z.string(),
        mealId: z.string().uuid(),
        name: z.string().min(1),
        servingSize: z.number(),
        servingUnit: z.string(),
        calories: z.number(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fat: z.number().optional(),
        fiber: z.number().optional(),
        sugar: z.number().optional(),
        sodium: z.number().optional(),
        barcode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const meal = await db.query.meals.findFirst({
        where: and(eq(meals.id, input.mealId), eq(meals.userId, userId)),
      });

      if (!meal) {
        throw new Error("Meal not found or access denied");
      }

      const [entry] = await db
        .insert(foodEntries)
        .values({
          mealId: input.mealId,
          name: input.name,
          servingSize: input.servingSize,
          servingUnit: input.servingUnit,
          calories: input.calories,
          protein: input.protein,
          carbs: input.carbs,
          fat: input.fat,
          fiber: input.fiber,
          sugar: input.sugar,
          sodium: input.sodium,
          barcode: input.barcode,
        })
        .returning();

      await db
        .update(meals)
        .set({
          totalCalories: sql`${meals.totalCalories} + ${input.calories}`,
          totalProtein: sql`${meals.totalProtein} + ${input.protein || 0}`,
          totalCarbs: sql`${meals.totalCarbs} + ${input.carbs || 0}`,
          totalFat: sql`${meals.totalFat} + ${input.fat || 0}`,
        })
        .where(and(eq(meals.id, input.mealId), eq(meals.userId, userId)));

      return entry;
    }),

  getMealsByDate: publicProcedure
    .input(
      z.object({
        token: z.string(),
        date: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const mealsList = await db.query.meals.findMany({
        where: and(eq(meals.userId, userId), eq(meals.date, input.date)),
        with: {
          foodEntries: true,
        },
        orderBy: [meals.mealType],
      });

      return mealsList;
    }),

  getDailyTotals: publicProcedure
    .input(
      z.object({
        token: z.string(),
        date: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const mealsList = await db.query.meals.findMany({
        where: and(eq(meals.userId, userId), eq(meals.date, input.date)),
      });

      const totals = mealsList.reduce(
        (acc, meal) => ({
          calories: acc.calories + (meal.totalCalories || 0),
          protein: acc.protein + (meal.totalProtein || 0),
          carbs: acc.carbs + (meal.totalCarbs || 0),
          fat: acc.fat + (meal.totalFat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      return totals;
    }),

  deleteMeal: publicProcedure
    .input(
      z.object({
        token: z.string(),
        mealId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const [deleted] = await db
        .delete(meals)
        .where(and(eq(meals.id, input.mealId), eq(meals.userId, userId)))
        .returning();

      if (!deleted) {
        throw new Error("Meal not found");
      }

      return { success: true };
    }),

  deleteFoodEntry: publicProcedure
    .input(
      z.object({
        token: z.string(),
        entryId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const entry = await db.query.foodEntries.findFirst({
        where: eq(foodEntries.id, input.entryId),
        with: {
          meal: true,
        },
      });

      if (!entry) {
        throw new Error("Food entry not found");
      }

      if (entry.meal.userId !== userId) {
        throw new Error("Access denied");
      }

      await db.delete(foodEntries).where(eq(foodEntries.id, input.entryId));

      await db
        .update(meals)
        .set({
          totalCalories: sql`${meals.totalCalories} - ${entry.calories}`,
          totalProtein: sql`${meals.totalProtein} - ${entry.protein || 0}`,
          totalCarbs: sql`${meals.totalCarbs} - ${entry.carbs || 0}`,
          totalFat: sql`${meals.totalFat} - ${entry.fat || 0}`,
        })
        .where(and(eq(meals.id, entry.mealId), eq(meals.userId, userId)));

      return { success: true };
    }),

  getGoals: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      let goals = await db.query.nutritionGoals.findFirst({
        where: eq(nutritionGoals.userId, userId),
      });

      if (!goals) {
        const [newGoals] = await db
          .insert(nutritionGoals)
          .values({ userId })
          .returning();
        goals = newGoals;
      }

      return goals;
    }),

  updateGoals: publicProcedure
    .input(
      z.object({
        token: z.string(),
        dailyCalories: z.number().optional(),
        dailyProtein: z.number().optional(),
        dailyCarbs: z.number().optional(),
        dailyFat: z.number().optional(),
        dailyFiber: z.number().optional(),
        dailyWater: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (input.dailyCalories !== undefined) updateData.dailyCalories = input.dailyCalories;
      if (input.dailyProtein !== undefined) updateData.dailyProtein = input.dailyProtein;
      if (input.dailyCarbs !== undefined) updateData.dailyCarbs = input.dailyCarbs;
      if (input.dailyFat !== undefined) updateData.dailyFat = input.dailyFat;
      if (input.dailyFiber !== undefined) updateData.dailyFiber = input.dailyFiber;
      if (input.dailyWater !== undefined) updateData.dailyWater = input.dailyWater;

      const [goals] = await db
        .update(nutritionGoals)
        .set(updateData)
        .where(eq(nutritionGoals.userId, userId))
        .returning();

      return goals;
    }),

  logWater: publicProcedure
    .input(
      z.object({
        token: z.string(),
        date: z.string(),
        glasses: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const existing = await db.query.waterLogs.findFirst({
        where: and(eq(waterLogs.userId, userId), eq(waterLogs.date, input.date)),
      });

      if (existing) {
        const [updated] = await db
          .update(waterLogs)
          .set({ glasses: input.glasses })
          .where(eq(waterLogs.id, existing.id))
          .returning();
        return updated;
      }

      const [newLog] = await db
        .insert(waterLogs)
        .values({
          userId,
          date: input.date,
          glasses: input.glasses,
        })
        .returning();

      return newLog;
    }),

  getWaterLog: publicProcedure
    .input(
      z.object({
        token: z.string(),
        date: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const log = await db.query.waterLogs.findFirst({
        where: and(eq(waterLogs.userId, userId), eq(waterLogs.date, input.date)),
      });

      return log || { glasses: 0 };
    }),

  getWeeklyStats: publicProcedure
    .input(
      z.object({
        token: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const mealsList = await db.query.meals.findMany({
        where: and(
          eq(meals.userId, userId),
          gte(meals.date, input.startDate),
          lte(meals.date, input.endDate)
        ),
      });

      const dailyData: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};

      mealsList.forEach((meal) => {
        if (!dailyData[meal.date]) {
          dailyData[meal.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        dailyData[meal.date].calories += meal.totalCalories || 0;
        dailyData[meal.date].protein += meal.totalProtein || 0;
        dailyData[meal.date].carbs += meal.totalCarbs || 0;
        dailyData[meal.date].fat += meal.totalFat || 0;
      });

      return dailyData;
    }),

  addFavorite: publicProcedure
    .input(
      z.object({
        token: z.string(),
        name: z.string().min(1),
        portion: z.string(),
        calories: z.number(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fat: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const existing = await db.query.favoriteFoods.findFirst({
        where: and(
          eq(favoriteFoods.userId, userId),
          eq(favoriteFoods.name, input.name)
        ),
      });

      if (existing) {
        return existing;
      }

      const [favorite] = await db
        .insert(favoriteFoods)
        .values({
          userId,
          name: input.name,
          portion: input.portion,
          calories: input.calories,
          protein: input.protein || 0,
          carbs: input.carbs || 0,
          fat: input.fat || 0,
        })
        .returning();

      return favorite;
    }),

  removeFavorite: publicProcedure
    .input(
      z.object({
        token: z.string(),
        favoriteId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      await db
        .delete(favoriteFoods)
        .where(
          and(
            eq(favoriteFoods.id, input.favoriteId),
            eq(favoriteFoods.userId, userId)
          )
        );

      return { success: true };
    }),

  getFavorites: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const favorites = await db.query.favoriteFoods.findMany({
        where: eq(favoriteFoods.userId, userId),
        orderBy: [desc(favoriteFoods.createdAt)],
      });

      return favorites;
    }),

  isFavorite: publicProcedure
    .input(
      z.object({
        token: z.string(),
        name: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const favorite = await db.query.favoriteFoods.findFirst({
        where: and(
          eq(favoriteFoods.userId, userId),
          eq(favoriteFoods.name, input.name)
        ),
      });

      return { isFavorite: !!favorite, favoriteId: favorite?.id };
    }),
});
