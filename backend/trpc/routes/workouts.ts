import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { db } from "../../db";
import { workouts, workoutExercises, exerciseSets, exercises, personalRecords } from "../../db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

const getSecretKey = () => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(JWT_SECRET);
};

async function verifyToken(token: string): Promise<{ sub: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || !payload.email) return null;
    return { sub: payload.sub as string, email: payload.email as string };
  } catch {
    return null;
  }
}

async function getUserIdFromToken(token: string): Promise<string> {
  const decoded = await verifyToken(token);
  if (!decoded) {
    throw new Error("Invalid or expired token");
  }
  return decoded.sub;
}

export const workoutsRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        token: z.string(),
        name: z.string().min(1),
        notes: z.string().optional(),
        startedAt: z.string().transform((s) => new Date(s)),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const [workout] = await db
        .insert(workouts)
        .values({
          userId,
          name: input.name,
          notes: input.notes,
          startedAt: input.startedAt,
        })
        .returning();

      return workout;
    }),

  complete: publicProcedure
    .input(
      z.object({
        token: z.string(),
        workoutId: z.string().uuid(),
        duration: z.number().optional(),
        totalVolume: z.number().optional(),
        caloriesBurned: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const [workout] = await db
        .update(workouts)
        .set({
          completedAt: new Date(),
          duration: input.duration,
          totalVolume: input.totalVolume,
          caloriesBurned: input.caloriesBurned,
        })
        .where(and(eq(workouts.id, input.workoutId), eq(workouts.userId, userId)))
        .returning();

      if (!workout) {
        throw new Error("Workout not found");
      }

      return workout;
    }),

  getById: publicProcedure
    .input(
      z.object({
        token: z.string(),
        workoutId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const workout = await db.query.workouts.findFirst({
        where: and(eq(workouts.id, input.workoutId), eq(workouts.userId, userId)),
        with: {
          exercises: {
            with: {
              exercise: true,
              sets: true,
            },
            orderBy: (we, { asc }) => [asc(we.order)],
          },
        },
      });

      if (!workout) {
        throw new Error("Workout not found");
      }

      return workout;
    }),

  list: publicProcedure
    .input(
      z.object({
        token: z.string(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      let whereClause = eq(workouts.userId, userId);

      if (input.startDate) {
        whereClause = and(whereClause, gte(workouts.startedAt, new Date(input.startDate)))!;
      }
      if (input.endDate) {
        whereClause = and(whereClause, lte(workouts.startedAt, new Date(input.endDate)))!;
      }

      const workoutList = await db.query.workouts.findMany({
        where: whereClause,
        orderBy: [desc(workouts.startedAt)],
        limit: input.limit,
        offset: input.offset,
        with: {
          exercises: {
            with: {
              exercise: true,
            },
          },
        },
      });

      return workoutList;
    }),

  delete: publicProcedure
    .input(
      z.object({
        token: z.string(),
        workoutId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const [deleted] = await db
        .delete(workouts)
        .where(and(eq(workouts.id, input.workoutId), eq(workouts.userId, userId)))
        .returning();

      if (!deleted) {
        throw new Error("Workout not found");
      }

      return { success: true };
    }),

  addExercise: publicProcedure
    .input(
      z.object({
        token: z.string(),
        workoutId: z.string().uuid(),
        exerciseId: z.string().uuid(),
        order: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await getUserIdFromToken(input.token);

      const [workoutExercise] = await db
        .insert(workoutExercises)
        .values({
          workoutId: input.workoutId,
          exerciseId: input.exerciseId,
          order: input.order,
          notes: input.notes,
        })
        .returning();

      return workoutExercise;
    }),

  addSet: publicProcedure
    .input(
      z.object({
        token: z.string(),
        workoutExerciseId: z.string().uuid(),
        setNumber: z.number(),
        weight: z.number().optional(),
        reps: z.number().optional(),
        duration: z.number().optional(),
        distance: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await getUserIdFromToken(input.token);

      const [set] = await db
        .insert(exerciseSets)
        .values({
          workoutExerciseId: input.workoutExerciseId,
          setNumber: input.setNumber,
          weight: input.weight,
          reps: input.reps,
          duration: input.duration,
          distance: input.distance,
          completed: true,
        })
        .returning();

      return set;
    }),

  updateSet: publicProcedure
    .input(
      z.object({
        token: z.string(),
        setId: z.string().uuid(),
        weight: z.number().optional(),
        reps: z.number().optional(),
        completed: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await getUserIdFromToken(input.token);

      const updateData: Record<string, unknown> = {};
      if (input.weight !== undefined) updateData.weight = input.weight;
      if (input.reps !== undefined) updateData.reps = input.reps;
      if (input.completed !== undefined) updateData.completed = input.completed;

      const [set] = await db
        .update(exerciseSets)
        .set(updateData)
        .where(eq(exerciseSets.id, input.setId))
        .returning();

      return set;
    }),

  getStats: publicProcedure
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

      const completedWorkouts = await db.query.workouts.findMany({
        where: and(
          eq(workouts.userId, userId),
          gte(workouts.startedAt, startDate),
          sql`${workouts.completedAt} IS NOT NULL`
        ),
      });

      const totalWorkouts = completedWorkouts.length;
      const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      const totalVolume = completedWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
      const totalCalories = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

      return {
        totalWorkouts,
        totalDuration,
        totalVolume,
        totalCalories,
        averageWorkoutDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
      };
    }),
});

export const exercisesRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        token: z.string(),
        muscleGroup: z.string().optional(),
        includeCustom: z.boolean().default(true),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      let whereClause = sql`(${exercises.userId} IS NULL OR ${exercises.userId} = ${userId})`;
      if (input.muscleGroup) {
        whereClause = sql`${whereClause} AND ${exercises.muscleGroup} = ${input.muscleGroup}`;
      }
      if (!input.includeCustom) {
        whereClause = sql`${whereClause} AND ${exercises.isCustom} = false`;
      }

      const exerciseList = await db.query.exercises.findMany({
        where: whereClause,
        orderBy: [exercises.name],
      });

      return exerciseList;
    }),

  create: publicProcedure
    .input(
      z.object({
        token: z.string(),
        name: z.string().min(1),
        muscleGroup: z.string().min(1),
        equipment: z.string().optional(),
        instructions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const [exercise] = await db
        .insert(exercises)
        .values({
          userId,
          name: input.name,
          muscleGroup: input.muscleGroup,
          equipment: input.equipment,
          instructions: input.instructions,
          isCustom: true,
        })
        .returning();

      return exercise;
    }),

  delete: publicProcedure
    .input(
      z.object({
        token: z.string(),
        exerciseId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const [deleted] = await db
        .delete(exercises)
        .where(and(eq(exercises.id, input.exerciseId), eq(exercises.userId, userId), eq(exercises.isCustom, true)))
        .returning();

      if (!deleted) {
        throw new Error("Exercise not found or cannot be deleted");
      }

      return { success: true };
    }),

  getPersonalRecords: publicProcedure
    .input(
      z.object({
        token: z.string(),
        exerciseId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      let whereClause = eq(personalRecords.userId, userId);
      if (input.exerciseId) {
        whereClause = and(whereClause, eq(personalRecords.exerciseId, input.exerciseId))!;
      }

      const records = await db.query.personalRecords.findMany({
        where: whereClause,
        with: {
          exercise: true,
        },
        orderBy: [desc(personalRecords.achievedAt)],
      });

      return records;
    }),

  addPersonalRecord: publicProcedure
    .input(
      z.object({
        token: z.string(),
        exerciseId: z.string().uuid(),
        weight: z.number(),
        reps: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = await getUserIdFromToken(input.token);

      const oneRepMax = input.weight * (1 + input.reps / 30);

      const [record] = await db
        .insert(personalRecords)
        .values({
          userId,
          exerciseId: input.exerciseId,
          weight: input.weight,
          reps: input.reps,
          oneRepMax,
          achievedAt: new Date(),
        })
        .returning();

      return record;
    }),
});
