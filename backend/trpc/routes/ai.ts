import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import { searchIndianFoods } from "../../data/indian-foods";

// Lazy init OpenAI to prevent crashes if this file is imported in frontend contexts
const getOpenAI = () => {
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
};

const USDA_API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";

interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  brandName?: string;
}

export const aiRouter = createTRPCRouter({
  searchFoodDatabase: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const indianResults = searchIndianFoods(input.query).map(food => ({
          id: food.id,
          name: food.name + (food.hindiName ? ` (${food.hindiName})` : ""),
          brand: "Indian Food",
          portion: food.servingSize,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        }));

        let usdaFoods: any[] = [];
        try {
          const response = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(input.query)}&pageSize=10`
          );

          if (response.ok) {
            const data = await response.json();
            usdaFoods = (data.foods || []).map((food: USDAFood) => {
              const nutrients = food.foodNutrients || [];

              const getNumericNutrient = (ids: number[]): number => {
                for (const id of ids) {
                  const nutrient = nutrients.find((n: USDANutrient) => n.nutrientId === id);
                  if (nutrient && typeof nutrient.value === 'number') {
                    return Math.round(nutrient.value);
                  }
                }
                return 0;
              };

              return {
                id: `usda_${food.fdcId}`,
                name: food.description,
                brand: food.brandName || "USDA",
                portion: food.servingSize
                  ? `${food.servingSize}${food.servingSizeUnit || 'g'}`
                  : "100g",
                calories: getNumericNutrient([1008, 2047, 2048]),
                protein: getNumericNutrient([1003]),
                carbs: getNumericNutrient([1005]),
                fat: getNumericNutrient([1004]),
              };
            });
          }
        } catch (e) {
          console.error("USDA API error:", e);
        }

        const foods = [...indianResults, ...usdaFoods].slice(0, 20);
        return { foods };
      } catch (error) {
        console.error("Food search error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search food database",
        });
      }
    }),


  transcribeAndAnalyzeFood: publicProcedure
    .input(
      z.object({
        base64Audio: z.string(),
        mimeType: z.string().default("audio/webm"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const audioBuffer = Buffer.from(input.base64Audio, "base64");

        const extension = input.mimeType.includes("wav") ? "wav" :
          input.mimeType.includes("mp3") ? "mp3" :
            input.mimeType.includes("m4a") ? "m4a" : "webm";

        const audioFile = new File([audioBuffer], `audio.${extension}`, {
          type: input.mimeType,
        });

        const transcription = await getOpenAI().audio.transcriptions.create({
          model: "whisper-1",
          file: audioFile,
          language: "en",
        });

        const transcribedText = transcription.text;
        if (!transcribedText || transcribedText.trim() === "") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Could not understand the audio. Please try again.",
          });
        }

        const analysisResponse = await getOpenAI().chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a nutrition expert. The user will describe food they ate. Extract the food information and estimate nutritional values. Return a JSON object with:
{
  "name": "name of the food/dish",
  "portion": "portion size mentioned or estimated (e.g., '1 cup', '200g', '1 serving')",
  "calories": estimated calories (number),
  "protein": estimated protein in grams (number),
  "carbs": estimated carbs in grams (number),
  "fat": estimated fat in grams (number),
  "confidence": "high" | "medium" | "low"
}
Return ONLY the JSON object. If unclear, make reasonable assumptions.`,
            },
            {
              role: "user",
              content: transcribedText,
            },
          ],
          max_completion_tokens: 512,
        });

        const content = analysisResponse.choices[0]?.message?.content;
        if (!content) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "No response from AI",
          });
        }

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to parse AI response",
          });
        }

        const result = JSON.parse(jsonMatch[0]);
        return {
          transcription: transcribedText,
          name: result.name || "Unknown Food",
          portion: result.portion || "1 serving",
          calories: Number(result.calories) || 0,
          protein: Number(result.protein) || 0,
          carbs: Number(result.carbs) || 0,
          fat: Number(result.fat) || 0,
          confidence: result.confidence || "medium",
        };
      } catch (error) {
        console.error("Voice analysis error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to transcribe and analyze audio",
        });
      }
    }),

  analyzeFood: publicProcedure
    .input(
      z.object({
        base64Image: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await getOpenAI().chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this food image and provide nutritional information. Return a JSON object with:
{
  "name": "name of the food/dish",
  "portion": "estimated portion size (e.g., '1 cup', '200g', '1 plate')",
  "calories": estimated calories (number),
  "protein": estimated protein in grams (number),
  "carbs": estimated carbs in grams (number),
  "fat": estimated fat in grams (number),
  "confidence": "high" | "medium" | "low",
  "items": ["list of individual food items detected"]
}

Be as accurate as possible with nutritional estimates based on the visible portion size. If you can identify specific items, estimate each one's contribution. Return ONLY the JSON object, no other text.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${input.base64Image}`,
                  },
                },
              ],
            },
          ],
          max_completion_tokens: 1024,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "No response from AI",
          });
        }

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to parse AI response",
          });
        }

        const result = JSON.parse(jsonMatch[0]);
        return {
          name: result.name || "Unknown Food",
          portion: result.portion || "1 serving",
          calories: Number(result.calories) || 0,
          protein: Number(result.protein) || 0,
          carbs: Number(result.carbs) || 0,
          fat: Number(result.fat) || 0,
          confidence: result.confidence || "medium",
          items: result.items || [],
        };
      } catch (error) {
        console.error("Food analysis error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze food image",
        });
      }
    }),
});
