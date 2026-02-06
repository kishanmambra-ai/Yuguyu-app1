import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { db } from "../../db";
import { userProgress, cardioSessions } from "../../db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
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

export const progressRouter = createTRPCRouter({
  logProgress: publicProcedure
    .input(
      z.object({
        token: z.string(),
        date: z.string(),
        weight: z.number().optional(),
        bodyFat: z.number().optional(),
        muscleMass: z.number().optional(),
        chest: z.number().optional(),
        waist: z.number().optional(),
        hips: z.number().optional(),
        arms: z.number().optional(),
        thighs: z.number().optional(),
        notes: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const [progress] = await db
        .insert(userProgress)
        .values({
          userId,
          date: input.date,
          weight: input.weight,
          bodyFat: input.bodyFat,
          muscleMass: input.muscleMass,
          chest: input.chest,
          waist: input.waist,
          hips: input.hips,
          arms: input.arms,
          thighs: input.thighs,
          notes: input.notes,
          imageUrl: input.imageUrl,
        })
        .returning();

      return progress;
    }),

  getHistory: publicProcedure
    .input(
      z.object({
        token: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(100).default(30),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      let whereClause = eq(userProgress.userId, userId);
      if (input.startDate) {
        whereClause = and(whereClause, gte(userProgress.date, input.startDate))!;
      }
      if (input.endDate) {
        whereClause = and(whereClause, lte(userProgress.date, input.endDate))!;
      }

      const history = await db.query.userProgress.findMany({
        where: whereClause,
        orderBy: [desc(userProgress.date)],
        limit: input.limit,
      });

      return history;
    }),

  getLatest: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const latest = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        orderBy: [desc(userProgress.date)],
      });

      return latest;
    }),

  deleteProgress: publicProcedure
    .input(
      z.object({
        token: z.string(),
        progressId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const [deleted] = await db
        .delete(userProgress)
        .where(and(eq(userProgress.id, input.progressId), eq(userProgress.userId, userId)))
        .returning();

      if (!deleted) {
        throw new Error("Progress entry not found");
      }

      return { success: true };
    }),

  getWeightTrend: publicProcedure
    .input(
      z.object({
        token: z.string(),
        days: z.number().min(7).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const history = await db.query.userProgress.findMany({
        where: and(
          eq(userProgress.userId, userId),
          gte(userProgress.date, startDate.toISOString().split("T")[0])
        ),
        orderBy: [userProgress.date],
      });

      const weightData = history
        .filter((p) => p.weight !== null)
        .map((p) => ({
          date: p.date,
          weight: p.weight,
        }));

      if (weightData.length < 2) {
        return { trend: "stable", change: 0, data: weightData };
      }

      const firstWeight = weightData[0].weight!;
      const lastWeight = weightData[weightData.length - 1].weight!;
      const change = lastWeight - firstWeight;
      const trend = change > 0.5 ? "up" : change < -0.5 ? "down" : "stable";

      return { trend, change, data: weightData };
    }),

  logCardio: publicProcedure
    .input(
      z.object({
        token: z.string(),
        activityType: z.string(),
        duration: z.number(),
        distance: z.number().optional(),
        calories: z.number().optional(),
        avgHeartRate: z.number().optional(),
        maxHeartRate: z.number().optional(),
        notes: z.string().optional(),
        startedAt: z.string().transform((s) => new Date(s)),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const [session] = await db
        .insert(cardioSessions)
        .values({
          userId,
          activityType: input.activityType,
          duration: input.duration,
          distance: input.distance,
          calories: input.calories,
          avgHeartRate: input.avgHeartRate,
          maxHeartRate: input.maxHeartRate,
          notes: input.notes,
          startedAt: input.startedAt,
          completedAt: new Date(),
        })
        .returning();

      return session;
    }),

  getCardioHistory: publicProcedure
    .input(
      z.object({
        token: z.string(),
        activityType: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      let whereClause = eq(cardioSessions.userId, userId);
      if (input.activityType) {
        whereClause = and(whereClause, eq(cardioSessions.activityType, input.activityType))!;
      }

      const sessions = await db.query.cardioSessions.findMany({
        where: whereClause,
        orderBy: [desc(cardioSessions.startedAt)],
        limit: input.limit,
      });

      return sessions;
    }),

  getCardioStats: publicProcedure
    .input(
      z.object({
        token: z.string(),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const sessions = await db.query.cardioSessions.findMany({
        where: and(
          eq(cardioSessions.userId, userId),
          gte(cardioSessions.startedAt, startDate)
        ),
      });

      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
      const totalDistance = sessions.reduce((sum, s) => sum + (s.distance || 0), 0);
      const totalCalories = sessions.reduce((sum, s) => sum + (s.calories || 0), 0);

      const byActivity: Record<string, { count: number; duration: number; distance: number; calories: number }> = {};
      sessions.forEach((s) => {
        if (!byActivity[s.activityType]) {
          byActivity[s.activityType] = { count: 0, duration: 0, distance: 0, calories: 0 };
        }
        byActivity[s.activityType].count++;
        byActivity[s.activityType].duration += s.duration;
        byActivity[s.activityType].distance += s.distance || 0;
        byActivity[s.activityType].calories += s.calories || 0;
      });

      return {
        totalSessions,
        totalDuration,
        totalDistance,
        totalCalories,
        byActivity,
      };
    }),
});
