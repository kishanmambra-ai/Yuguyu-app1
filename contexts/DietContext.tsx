import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useState } from "react";

import {
  DailyInsight,
  DailyNutrition,
  FoodItem,
  MealLog,
  MealType,
  UserNutritionGoals,
  WeightEntry,
} from "@/types/diet";

const MEALS_KEY = "yuguyu_meals";
const GOALS_KEY = "yuguyu_nutrition_goals";
const WATER_KEY = "yuguyu_water_";
const MOOD_KEY = "yuguyu_mood_";
const ENERGY_KEY = "yuguyu_energy_";
const WEIGHT_KEY = "yuguyu_weight_entries";
const FAVORITES_KEY = "yuguyu_favorite_foods";

export interface FavoriteFood {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DEFAULT_GOALS: UserNutritionGoals = {
  targetCalories: 2000,
  targetProtein: 150,
  targetCarbs: 200,
  targetFat: 65,
  waterGoal: 8,
  bottleSize: 250,
};

export const [DietProvider, useDiet] = createContextHook(() => {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [goals, setGoals] = useState<UserNutritionGoals>(DEFAULT_GOALS);
  const [waterGlasses, setWaterGlasses] = useState<number>(0);
  const [mood, setMood] = useState<"bad" | "okay" | "good" | "great">("good");
  const [energyLevel, setEnergyLevel] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [currentDate, setCurrentDate] = useState<string>(getLocalDateString());
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<FavoriteFood[]>([]);

  const getTodayKey = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadData = useCallback(async () => {
    try {
      const today = getTodayKey();
      const [mealsData, goalsData, waterData, moodData, energyData, weightData] =
        await Promise.all([
          AsyncStorage.getItem(MEALS_KEY),
          AsyncStorage.getItem(GOALS_KEY),
          AsyncStorage.getItem(WATER_KEY + today),
          AsyncStorage.getItem(MOOD_KEY + today),
          AsyncStorage.getItem(ENERGY_KEY + today),
          AsyncStorage.getItem(WEIGHT_KEY),
        ]);

      if (mealsData && mealsData !== 'undefined' && mealsData !== 'null' && (mealsData.trim().startsWith('[') || mealsData.trim().startsWith('{'))) {
        try {
          const allMeals = JSON.parse(mealsData);
          if (Array.isArray(allMeals)) {
            const todayMeals = allMeals.filter((m: MealLog) => m.date === today);
            setMeals(todayMeals);
          }
        } catch (parseError) {
          console.error("Failed to parse meals data:", parseError);
          await AsyncStorage.removeItem(MEALS_KEY);
          setMeals([]);
        }
      }

      if (goalsData && goalsData !== 'undefined' && goalsData !== 'null' && (goalsData.trim().startsWith('[') || goalsData.trim().startsWith('{'))) {
        try {
          const savedGoals = JSON.parse(goalsData);
          setGoals({ ...DEFAULT_GOALS, ...savedGoals });
        } catch (parseError) {
          console.error("Failed to parse goals data:", parseError);
          await AsyncStorage.removeItem(GOALS_KEY);
          setGoals(DEFAULT_GOALS);
        }
      }

      if (waterData && waterData !== 'undefined' && waterData !== 'null') {
        const parsed = parseInt(waterData);
        setWaterGlasses(isNaN(parsed) ? 0 : parsed);
      } else {
        setWaterGlasses(0);
      }

      if (moodData && moodData !== 'undefined' && moodData !== 'null') {
        setMood(moodData as "bad" | "okay" | "good" | "great");
      } else {
        setMood("good");
      }

      if (energyData && energyData !== 'undefined' && energyData !== 'null') {
        setEnergyLevel(energyData as "low" | "medium" | "high");
      } else {
        setEnergyLevel("medium");
      }

      if (weightData && weightData !== 'undefined' && weightData !== 'null' && (weightData.trim().startsWith('[') || weightData.trim().startsWith('{'))) {
        try {
          const entries = JSON.parse(weightData);
          if (Array.isArray(entries)) {
            setWeightEntries(entries);
          }
        } catch (parseError) {
          console.error("Failed to parse weight data:", parseError);
          await AsyncStorage.removeItem(WEIGHT_KEY);
          setWeightEntries([]);
        }
      }

      // Load favorites
      const favoritesData = await AsyncStorage.getItem(FAVORITES_KEY);
      if (favoritesData && favoritesData !== 'undefined' && favoritesData !== 'null') {
        try {
          const favorites = JSON.parse(favoritesData);
          if (Array.isArray(favorites)) {
            setFavoriteFoods(favorites);
          }
        } catch (parseError) {
          console.error("Failed to parse favorites data:", parseError);
          await AsyncStorage.removeItem(FAVORITES_KEY);
          setFavoriteFoods([]);
        }
      }
    } catch (error) {
      console.error("Failed to load diet data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDateData = useCallback(async (date: Date) => {
    try {
      const dateKey = getDateKey(date);
      setCurrentDate(dateKey);
      const [mealsData, waterData, moodData, energyData] =
        await Promise.all([
          AsyncStorage.getItem(MEALS_KEY),
          AsyncStorage.getItem(WATER_KEY + dateKey),
          AsyncStorage.getItem(MOOD_KEY + dateKey),
          AsyncStorage.getItem(ENERGY_KEY + dateKey),
        ]);

      if (mealsData && mealsData !== 'undefined' && mealsData !== 'null' && (mealsData.trim().startsWith('[') || mealsData.trim().startsWith('{'))) {
        try {
          const allMeals = JSON.parse(mealsData);
          if (Array.isArray(allMeals)) {
            const dateMeals = allMeals.filter((m: MealLog) => m.date === dateKey);
            setMeals(dateMeals);
          } else {
            setMeals([]);
          }
        } catch (parseError) {
          console.error("Failed to parse meals data for date:", parseError);
          await AsyncStorage.removeItem(MEALS_KEY);
          setMeals([]);
        }
      } else {
        setMeals([]);
      }

      if (waterData && waterData !== 'undefined' && waterData !== 'null') {
        const parsed = parseInt(waterData);
        setWaterGlasses(isNaN(parsed) ? 0 : parsed);
      } else {
        setWaterGlasses(0);
      }

      if (moodData && moodData !== 'undefined' && moodData !== 'null') {
        setMood(moodData as "bad" | "okay" | "good" | "great");
      } else {
        setMood("good");
      }

      if (energyData && energyData !== 'undefined' && energyData !== 'null') {
        setEnergyLevel(energyData as "low" | "medium" | "high");
      } else {
        setEnergyLevel("medium");
      }
    } catch (error) {
      console.error("Failed to load date data:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveMeals = useCallback(async (updatedMeals: MealLog[]) => {
    try {
      const existingData = await AsyncStorage.getItem(MEALS_KEY);
      let allMeals: MealLog[] = [];
      if (existingData && existingData !== 'undefined' && existingData !== 'null' && (existingData.trim().startsWith('[') || existingData.trim().startsWith('{'))) {
        try {
          allMeals = JSON.parse(existingData);
          if (!Array.isArray(allMeals)) {
            allMeals = [];
          }
        } catch (parseError) {
          console.error("Failed to parse meals data:", parseError);
          await AsyncStorage.removeItem(MEALS_KEY);
          allMeals = [];
        }
      }

      const otherDaysMeals = allMeals.filter((m: MealLog) => m.date !== currentDate);
      const newAllMeals = [...otherDaysMeals, ...updatedMeals];

      await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(newAllMeals));
      setMeals(updatedMeals);

      console.log("Meals saved successfully");
    } catch (error) {
      console.error("Failed to save meals:", error);
    }
  }, [currentDate]);

  const addFoodToMeal = useCallback(
    async (mealType: MealType, item: FoodItem) => {
      const existingMeal = meals.find((m) => m.mealType === mealType);

      if (existingMeal) {
        const updatedItems = [...existingMeal.items, item];
        const updatedMacros = updatedItems.reduce(
          (acc, i) => ({
            protein: acc.protein + i.macros.protein,
            carbs: acc.carbs + i.macros.carbs,
            fat: acc.fat + i.macros.fat,
          }),
          { protein: 0, carbs: 0, fat: 0 },
        );
        const updatedCalories = updatedItems.reduce(
          (sum, i) => sum + i.calories,
          0,
        );

        const updatedMeals = meals.map((m) =>
          m.mealType === mealType
            ? {
              ...m,
              items: updatedItems,
              macros: updatedMacros,
              calories: updatedCalories,
            }
            : m,
        );
        await saveMeals(updatedMeals);
      } else {
        const newMeal: MealLog = {
          id: Date.now().toString(),
          clientId: `${Date.now()}_${Math.random()}`,
          date: currentDate,
          mealType,
          items: [item],
          calories: item.calories,
          macros: { ...item.macros },
          loggedAt: new Date().toISOString(),
          synced: false,
        };
        await saveMeals([...meals, newMeal]);
      }
    },
    [meals, saveMeals, currentDate],
  );

  const removeFoodFromMeal = useCallback(
    async (mealType: MealType, itemId: string) => {
      const meal = meals.find((m) => m.mealType === mealType);
      if (!meal) return;

      const updatedItems = meal.items.filter((i) => i.id !== itemId);

      if (updatedItems.length === 0) {
        const updatedMeals = meals.filter((m) => m.mealType !== mealType);
        await saveMeals(updatedMeals);
      } else {
        const updatedMacros = updatedItems.reduce(
          (acc, i) => ({
            protein: acc.protein + i.macros.protein,
            carbs: acc.carbs + i.macros.carbs,
            fat: acc.fat + i.macros.fat,
          }),
          { protein: 0, carbs: 0, fat: 0 },
        );
        const updatedCalories = updatedItems.reduce(
          (sum, i) => sum + i.calories,
          0,
        );

        const updatedMeals = meals.map((m) =>
          m.mealType === mealType
            ? {
              ...m,
              items: updatedItems,
              macros: updatedMacros,
              calories: updatedCalories,
            }
            : m,
        );
        await saveMeals(updatedMeals);
      }
    },
    [meals, saveMeals],
  );

  const updateFoodInMeal = useCallback(
    async (mealType: MealType, itemId: string, updatedItem: FoodItem) => {
      const meal = meals.find((m) => m.mealType === mealType);
      if (!meal) return;

      const updatedItems = meal.items.map((i) =>
        i.id === itemId ? updatedItem : i,
      );

      const updatedMacros = updatedItems.reduce(
        (acc, i) => ({
          protein: acc.protein + i.macros.protein,
          carbs: acc.carbs + i.macros.carbs,
          fat: acc.fat + i.macros.fat,
        }),
        { protein: 0, carbs: 0, fat: 0 },
      );
      const updatedCalories = updatedItems.reduce(
        (sum, i) => sum + i.calories,
        0,
      );

      const updatedMeals = meals.map((m) =>
        m.mealType === mealType
          ? {
            ...m,
            items: updatedItems,
            macros: updatedMacros,
            calories: updatedCalories,
          }
          : m,
      );
      await saveMeals(updatedMeals);
    },
    [meals, saveMeals],
  );

  const updateWaterIntake = useCallback(
    async (glasses: number) => {
      try {
        await AsyncStorage.setItem(WATER_KEY + currentDate, glasses.toString());
        setWaterGlasses(glasses);
      } catch (error) {
        console.error("Failed to update water:", error);
      }
    },
    [currentDate],
  );

  const updateMood = useCallback(
    async (newMood: "bad" | "okay" | "good" | "great") => {
      try {
        await AsyncStorage.setItem(MOOD_KEY + currentDate, newMood);
        setMood(newMood);
      } catch (error) {
        console.error("Failed to update mood:", error);
      }
    },
    [currentDate],
  );

  const updateEnergyLevel = useCallback(
    async (level: "low" | "medium" | "high") => {
      try {
        await AsyncStorage.setItem(ENERGY_KEY + currentDate, level);
        setEnergyLevel(level);
      } catch (error) {
        console.error("Failed to update energy:", error);
      }
    },
    [currentDate],
  );

  const updateGoals = useCallback(async (newGoals: UserNutritionGoals) => {
    try {
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(newGoals));
      setGoals(newGoals);
    } catch (error) {
      console.error("Failed to update goals:", error);
    }
  }, []);

  const getTodayNutrition = useCallback((): DailyNutrition => {
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalMacros = meals.reduce(
      (acc, m) => ({
        protein: acc.protein + m.macros.protein,
        carbs: acc.carbs + m.macros.carbs,
        fat: acc.fat + m.macros.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 },
    );

    return {
      date: getTodayKey(),
      meals,
      totalCalories,
      totalMacros,
      targetCalories: goals.targetCalories,
      targetMacros: {
        protein: goals.targetProtein,
        carbs: goals.targetCarbs,
        fat: goals.targetFat,
      },
      waterGlasses,
      energyLevel,
      mood,
    };
  }, [meals, goals, waterGlasses, energyLevel, mood]);

  const getDateNutrition = useCallback((date: Date): DailyNutrition => {
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalMacros = meals.reduce(
      (acc, m) => ({
        protein: acc.protein + m.macros.protein,
        carbs: acc.carbs + m.macros.carbs,
        fat: acc.fat + m.macros.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 },
    );

    return {
      date: getDateKey(date),
      meals,
      totalCalories,
      totalMacros,
      targetCalories: goals.targetCalories,
      targetMacros: {
        protein: goals.targetProtein,
        carbs: goals.targetCarbs,
        fat: goals.targetFat,
      },
      waterGlasses,
      energyLevel,
      mood,
    };
  }, [meals, goals, waterGlasses, energyLevel, mood]);

  const getDailyInsights = useCallback((): DailyInsight[] => {
    const nutrition = getTodayNutrition();
    const insights: DailyInsight[] = [];

    const proteinPercent = Math.round(
      (nutrition.totalMacros.protein / goals.targetProtein) * 100,
    );
    if (proteinPercent >= 80) {
      insights.push({
        id: "1",
        type: "progress",
        message: `🌞 You've hit ${proteinPercent}% of your protein goal!`,
        icon: "🌞",
        date: getTodayKey(),
      });
    }

    const waterRemaining = goals.waterGoal - waterGlasses;
    if (waterRemaining > 0 && waterRemaining <= 3) {
      insights.push({
        id: "2",
        type: "tip",
        message: `💧 Stay hydrated — ${waterRemaining} glasses left.`,
        icon: "💧",
        date: getTodayKey(),
      });
    }

    const calorieDeficit = goals.targetCalories - nutrition.totalCalories;
    if (calorieDeficit > 0 && calorieDeficit <= 300) {
      insights.push({
        id: "3",
        type: "motivation",
        message: `⚖️ You're in a ${calorieDeficit} kcal deficit — perfect for fat loss.`,
        icon: "⚖️",
        date: getTodayKey(),
      });
    }

    if (nutrition.totalMacros.carbs > 150 && energyLevel === "high") {
      insights.push({
        id: "4",
        type: "ai-insight",
        message: "You sleep better when carbs are above 150g.",
        icon: "🧠",
        date: getTodayKey(),
      });
    }

    if (proteinPercent >= 90) {
      insights.push({
        id: "5",
        type: "ai-insight",
        message: "Protein consistency improving — nice work 💪.",
        icon: "💪",
        date: getTodayKey(),
      });
    }

    return insights;
  }, [getTodayNutrition, goals, waterGlasses, energyLevel]);

  const getMealByType = useCallback(
    (mealType: MealType): MealLog | undefined => {
      return meals.find((m) => m.mealType === mealType);
    },
    [meals],
  );

  const addWeightEntry = useCallback(async (weight: number, unit: "kg" | "lbs") => {
    try {
      const newEntry: WeightEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        weight,
        unit,
        loggedAt: new Date().toISOString(),
      };
      const updatedEntries = [...weightEntries, newEntry];
      await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(updatedEntries));
      setWeightEntries(updatedEntries);
    } catch (error) {
      console.error("Failed to add weight entry:", error);
    }
  }, [weightEntries]);

  const getLatestWeight = useCallback((): WeightEntry | undefined => {
    if (weightEntries.length === 0) return undefined;
    return weightEntries.reduce((latest, entry) =>
      new Date(entry.loggedAt) > new Date(latest.loggedAt) ? entry : latest
    );
  }, [weightEntries]);

  const addFavoriteFood = useCallback(async (food: Omit<FavoriteFood, 'id'>) => {
    try {
      // Check if already exists
      const existing = favoriteFoods.find(f => f.name.toLowerCase() === food.name.toLowerCase());
      if (existing) {
        return existing;
      }

      const newFavorite: FavoriteFood = {
        id: Date.now().toString(),
        ...food,
      };
      const updatedFavorites = [...favoriteFoods, newFavorite];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      setFavoriteFoods(updatedFavorites);
      return newFavorite;
    } catch (error) {
      console.error("Failed to add favorite:", error);
      throw error;
    }
  }, [favoriteFoods]);

  const removeFavoriteFood = useCallback(async (favoriteId: string) => {
    try {
      const updatedFavorites = favoriteFoods.filter(f => f.id !== favoriteId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      setFavoriteFoods(updatedFavorites);
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      throw error;
    }
  }, [favoriteFoods]);

  const isFavoriteFood = useCallback((name: string): { isFavorite: boolean; favoriteId?: string } => {
    const favorite = favoriteFoods.find(f => f.name.toLowerCase() === name.toLowerCase());
    return {
      isFavorite: !!favorite,
      favoriteId: favorite?.id,
    };
  }, [favoriteFoods]);

  const getHistoricalData = useCallback(async (days: number = 7) => {
    try {
      const mealsData = await AsyncStorage.getItem(MEALS_KEY);
      let allMeals: MealLog[] = [];
      if (mealsData && mealsData !== 'undefined' && mealsData !== 'null' && mealsData.trim().startsWith('[')) {
        try {
          allMeals = JSON.parse(mealsData);
          if (!Array.isArray(allMeals)) {
            console.warn('Meals data is not an array, resetting');
            allMeals = [];
            await AsyncStorage.removeItem(MEALS_KEY);
          }
        } catch (parseError) {
          console.error('Failed to parse meals data in getHistoricalData:', parseError, 'Data:', mealsData?.substring(0, 100));
          allMeals = [];
          await AsyncStorage.removeItem(MEALS_KEY);
        }
      }

      const today = new Date();
      const historicalData: {
        date: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        water: number;
        weight?: number;
      }[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];

        const dayMeals = allMeals.filter((m: MealLog) => m.date === dateKey);
        const dayCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
        const dayMacros = dayMeals.reduce(
          (acc, m) => ({
            protein: acc.protein + m.macros.protein,
            carbs: acc.carbs + m.macros.carbs,
            fat: acc.fat + m.macros.fat,
          }),
          { protein: 0, carbs: 0, fat: 0 }
        );

        const waterData = await AsyncStorage.getItem(WATER_KEY + dateKey);
        const dayWater = waterData && waterData !== 'undefined' && waterData !== 'null'
          ? parseInt(waterData)
          : 0;

        const dayWeight = weightEntries.find(w => w.date === dateKey);

        historicalData.push({
          date: dateKey,
          calories: dayCalories,
          protein: dayMacros.protein,
          carbs: dayMacros.carbs,
          fat: dayMacros.fat,
          water: isNaN(dayWater) ? 0 : dayWater,
          weight: dayWeight?.weight,
        });
      }

      return historicalData;
    } catch (error) {
      console.error('Failed to load historical data:', error);
      return [];
    }
  }, [weightEntries]);

  return {
    meals,
    goals,
    waterGlasses,
    mood,
    energyLevel,
    isLoading,
    addFoodToMeal,
    removeFoodFromMeal,
    updateFoodInMeal,
    updateWaterIntake,
    updateMood,
    updateEnergyLevel,
    updateGoals,
    getTodayNutrition,
    getDateNutrition,
    loadDateData,
    getDailyInsights,
    getMealByType,
    weightEntries,
    addWeightEntry,
    getLatestWeight,
    getHistoricalData,
    favoriteFoods,
    addFavoriteFood,
    removeFavoriteFood,
    isFavoriteFood,
  };
});
