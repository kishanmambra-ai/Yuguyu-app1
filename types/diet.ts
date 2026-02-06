export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  macros: Macros;
}

export interface MealLog {
  id: string;
  clientId: string;
  date: string;
  mealType: MealType;
  items: FoodItem[];
  calories: number;
  macros: Macros;
  loggedAt: string;
  synced: boolean;
  photoUrl?: string;
}

export interface DailyNutrition {
  date: string;
  meals: MealLog[];
  totalCalories: number;
  totalMacros: Macros;
  targetCalories: number;
  targetMacros: Macros;
  waterGlasses: number;
  energyLevel: "low" | "medium" | "high";
  mood: "bad" | "okay" | "good" | "great";
}

export interface MealRecommendation {
  id: string;
  name: string;
  cuisine: "south-indian" | "north-indian" | "vegan" | "quick" | "ayurvedic";
  calories: number;
  macros: Macros;
  prepTime: number;
  ingredients: string[];
  tags: string[];
}

export interface DailyInsight {
  id: string;
  type: "progress" | "tip" | "motivation" | "ai-insight";
  message: string;
  icon: string;
  date: string;
}

export interface NutritionTrend {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mood: "bad" | "okay" | "good" | "great";
  energyLevel: "low" | "medium" | "high";
}

export interface UserNutritionGoals {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  waterGoal: number;
  bottleSize: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  unit: "kg" | "lbs";
  loggedAt: string;
}
