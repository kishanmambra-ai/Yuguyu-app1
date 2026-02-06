import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../create-context";

const foodItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  portion: z.string(),
  calories: z.number(),
  macros: z.object({
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }),
});

const mealLogSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  date: z.string(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snacks"]),
  items: z.array(foodItemSchema),
  calories: z.number(),
  macros: z.object({
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }),
  loggedAt: z.string(),
  synced: z.boolean(),
  photoUrl: z.string().optional(),
});

export const dietRouter = createTRPCRouter({
  syncMealLogs: publicProcedure
    .input(
      z.object({
        meals: z.array(mealLogSchema),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("Syncing meal logs:", input.meals.length);
      return {
        success: true,
        syncedCount: input.meals.length,
      };
    }),

  recognizeFood: publicProcedure
    .input(
      z.object({
        imageUrl: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("Recognizing food from image:", input.imageUrl);
      return {
        candidates: [
          {
            name: "Paneer Tikka",
            confidence: 0.92,
            calories: 320,
            macros: { protein: 28, carbs: 12, fat: 18 },
          },
          {
            name: "Chicken Tikka",
            confidence: 0.85,
            calories: 280,
            macros: { protein: 32, carbs: 8, fat: 14 },
          },
        ],
      };
    }),

  parseVoiceLog: publicProcedure
    .input(
      z.object({
        audioUrl: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("Parsing voice log:", input.audioUrl);
      return {
        text: "I had two chapatis and dal for lunch",
        items: [
          {
            name: "Chapati",
            portion: "2 pieces",
            calories: 140,
            macros: { protein: 4, carbs: 28, fat: 2 },
          },
          {
            name: "Dal",
            portion: "1 bowl",
            calories: 180,
            macros: { protein: 12, carbs: 24, fat: 4 },
          },
        ],
      };
    }),

  getMealRecommendations: publicProcedure
    .input(
      z.object({
        cuisine: z
          .enum(["south-indian", "north-indian", "vegan", "quick", "ayurvedic"])
          .optional(),
        calorieTarget: z.number().optional(),
        proteinTarget: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      console.log("Getting meal recommendations:", input);
      return {
        recommendations: [
          {
            id: "1",
            name: "Idli Sambar with Coconut Chutney",
            cuisine: "south-indian",
            calories: 320,
            macros: { protein: 12, carbs: 58, fat: 6 },
            prepTime: 25,
            ingredients: [
              "4 idlis",
              "1 cup sambar",
              "2 tbsp coconut chutney",
            ],
            tags: ["Fermented", "High Protein", "Light"],
          },
        ],
      };
    }),

  generateInsights: publicProcedure
    .input(
      z.object({
        meals: z.array(mealLogSchema),
        goals: z.object({
          targetCalories: z.number(),
          targetProtein: z.number(),
          targetCarbs: z.number(),
          targetFat: z.number(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("Generating AI insights for meals");
      const proteinPercent = Math.round(
        (input.meals.reduce((sum, m) => sum + m.macros.protein, 0) /
          input.goals.targetProtein) *
          100,
      );

      return {
        insights: [
          {
            id: "ai-1",
            type: "ai-insight",
            message: `You're ${proteinPercent}% towards your protein goal. Keep it up!`,
            icon: "💪",
          },
          {
            id: "ai-2",
            type: "tip",
            message:
              "Your carb intake is consistent with your energy levels. Great balance!",
            icon: "🧠",
          },
        ],
      };
    }),
});
