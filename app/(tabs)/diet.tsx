import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Image as RNImage,
} from "react-native";
import {
  Plus,
  X,
  Check,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Edit2,
  Droplets,
  Minus,
  Scale,
  Search,
  Heart,
} from "lucide-react-native";
import { router } from "expo-router";
import { useState } from "react";

import Colors from "@/constants/colors";
import mealLibrary from "@/constants/meal-library";
import { useDiet } from "@/contexts/DietContext";
import { useAuth } from "@/contexts/AuthContext";
import { FoodItem, MealType } from "@/types/diet";
import { trpc, trpcClient } from "@/lib/trpc";

const MEAL_TYPES: { type: MealType; label: string; emoji: string }[] = [
  { type: "breakfast", label: "Breakfast", emoji: "🌅" },
  { type: "lunch", label: "Lunch", emoji: "☀️" },
  { type: "dinner", label: "Dinner", emoji: "🌙" },
  { type: "snacks", label: "Snacks", emoji: "🍎" },
];



export default function DietScreen() {
  const {
    getTodayNutrition,
    getDateNutrition,
    loadDateData,
    getDailyInsights,
    addFoodToMeal,
    removeFoodFromMeal,
    updateFoodInMeal,
    updateMood,
    updateEnergyLevel,
    updateGoals,
    goals,
    mood,
    energyLevel,
    waterGlasses,
    updateWaterIntake,
    isLoading,
    addWeightEntry,
    getLatestWeight,
    favoriteFoods,
    addFavoriteFood,
    removeFavoriteFood,
    isFavoriteFood,
  } = useDiet();

  const { getToken } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Local favorites - no backend needed!

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [editCalories, setEditCalories] = useState("");
  const [editProtein, setEditProtein] = useState("");
  const [editCarbs, setEditCarbs] = useState("");
  const [editFat, setEditFat] = useState("");
  const [editWaterGoal, setEditWaterGoal] = useState("");
  const [editBottleSize, setEditBottleSize] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(
    null,
  );
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [foodName, setFoodName] = useState("");
  const [portion, setPortion] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAddOptionsModal, setShowAddOptionsModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    name: string;
    brand: string | null;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);


  const [useCalculator, setUseCalculator] = useState(false);
  const [calcAge, setCalcAge] = useState("");
  const [calcGender, setCalcGender] = useState<"male" | "female">("male");
  const [calcHeight, setCalcHeight] = useState("");
  const [calcHeightUnit, setCalcHeightUnit] = useState<"cm" | "ft">("cm");
  const [calcHeightFeet, setCalcHeightFeet] = useState("");
  const [calcHeightInches, setCalcHeightInches] = useState("");
  const [calcWeight, setCalcWeight] = useState("");
  const [calcWeightUnit, setCalcWeightUnit] = useState<"kg" | "lbs">("kg");
  const [calcActivityLevel, setCalcActivityLevel] = useState<"sedentary" | "light" | "moderate" | "active" | "very_active">("moderate");
  const [calcGoal, setCalcGoal] = useState<"lose" | "maintain" | "gain">("maintain");

  const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const ACTIVITY_LABELS = {
    sedentary: "Sedentary (little/no exercise)",
    light: "Light (1-3 days/week)",
    moderate: "Moderate (3-5 days/week)",
    active: "Active (6-7 days/week)",
    very_active: "Very Active (2x/day)",
  };

  const GOAL_LABELS = {
    lose: "Lose Weight",
    maintain: "Maintain Weight",
    gain: "Build Muscle",
  };

  const calculateCaloriesAndMacros = () => {
    const age = parseInt(calcAge);
    let heightCm: number;
    let weightKg: number;

    if (calcHeightUnit === "ft") {
      const feet = parseFloat(calcHeightFeet) || 0;
      const inches = parseFloat(calcHeightInches) || 0;
      heightCm = (feet * 12 + inches) * 2.54;
    } else {
      heightCm = parseFloat(calcHeight);
    }

    if (calcWeightUnit === "lbs") {
      weightKg = parseFloat(calcWeight) * 0.453592;
    } else {
      weightKg = parseFloat(calcWeight);
    }

    if (!age || !heightCm || !weightKg || age <= 0 || heightCm <= 0 || weightKg <= 0) {
      Alert.alert("Missing Info", "Please fill in all fields correctly");
      return;
    }

    let bmr: number;
    if (calcGender === "male") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    const tdee = bmr * ACTIVITY_MULTIPLIERS[calcActivityLevel];

    let targetCalories: number;
    if (calcGoal === "lose") {
      targetCalories = Math.max(1200, tdee - Math.min(tdee * 0.2, 750));
    } else if (calcGoal === "gain") {
      targetCalories = tdee + Math.min(tdee * 0.12, 500);
    } else {
      targetCalories = tdee;
    }

    targetCalories = Math.round(targetCalories);

    let proteinPerKg: number;
    if (calcGoal === "lose") {
      proteinPerKg = 2.2;
    } else if (calcGoal === "gain") {
      proteinPerKg = 2.0;
    } else {
      proteinPerKg = 1.8;
    }

    const targetProtein = Math.round(weightKg * proteinPerKg / 5) * 5;
    const fatFloorFromWeight = Math.round(weightKg * 0.8);
    const fatFloorFromCalories = Math.round((targetCalories * 0.25) / 9);
    const targetFat = Math.round(Math.max(fatFloorFromWeight, fatFloorFromCalories) / 5) * 5;
    const remainingCalories = targetCalories - (targetProtein * 4) - (targetFat * 9);
    const targetCarbs = Math.round(Math.max(0, remainingCalories / 4) / 5) * 5;

    setEditCalories(targetCalories.toString());
    setEditProtein(targetProtein.toString());
    setEditCarbs(targetCarbs.toString());
    setEditFat(targetFat.toString());
    setUseCalculator(false);

    Alert.alert(
      "Goals Calculated!",
      `Based on your profile:\n\nCalories: ${targetCalories} kcal\nProtein: ${targetProtein}g\nCarbs: ${targetCarbs}g\nFat: ${targetFat}g\n\nYou can adjust these values if needed.`
    );
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const nutrition = isToday ? getTodayNutrition() : getDateNutrition(selectedDate);
  const insights = getDailyInsights();

  const handlePreviousDay = async () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    await loadDateData(newDate);
  };

  const handleNextDay = async () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    const today = new Date();
    if (newDate <= today) {
      setSelectedDate(newDate);
      await loadDateData(newDate);
    }
  };

  const formatDate = (date: Date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return {
      dayName: days[date.getDay()],
      fullDate: `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    };
  };

  const { dayName, fullDate } = formatDate(selectedDate);
  const canGoNext = selectedDate.toDateString() !== new Date().toDateString();

  const handleAddFood = async () => {
    if (!selectedMealType || !foodName || !calories) {
      Alert.alert("Missing Info", "Please fill in at least food name and calories");
      return;
    }

    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: foodName,
      portion: portion || "1 serving",
      calories: parseInt(calories) || 0,
      macros: {
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
      },
    };

    await addFoodToMeal(selectedMealType, newFood);

    setFoodName("");
    setPortion("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setShowAddModal(false);
    setSelectedMealType(null);
  };

  const openAddModal = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setFoodName("");
    setPortion("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setShowAddModal(true);
  };



  const openSearchModal = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setSearchQuery("");
    setSearchResults([]);
    setFoodName("");
    setPortion("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setShowSearchModal(true);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Call USDA API directly from the app
      const USDA_API_KEY = "OmK1OOpRUTXNz32CvFPM8AzriAmPrS5iCCE0DOrA";
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(searchQuery)}&pageSize=15`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch from USDA");
      }

      const data = await response.json();
      const foods = (data.foods || []).map((food: any) => {
        const nutrients = food.foodNutrients || [];

        const getNutrient = (ids: number[]): number => {
          for (const id of ids) {
            const nutrient = nutrients.find((n: any) => n.nutrientId === id);
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
          calories: getNutrient([1008, 2047, 2048]),
          protein: getNutrient([1003]),
          carbs: getNutrient([1005]),
          fat: getNutrient([1004]),
        };
      });

      setSearchResults(foods);
      if (foods.length === 0) {
        Alert.alert("No Results", "No foods found. Try a different search term.");
      }
    } catch (error: any) {
      console.error("Search error:", error);
      const errorMessage = error?.message || "Unknown error";
      Alert.alert("Search Failed", `Could not search the food database: ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (food: typeof searchResults[0]) => {
    setFoodName(food.name);
    setPortion(food.portion);
    setCalories(food.calories.toString());
    setProtein(food.protein.toString());
    setCarbs(food.carbs.toString());
    setFat(food.fat.toString());
    setSearchResults([]);
  };

  const handleAddSearchFood = async () => {
    if (!selectedMealType || !foodName || !calories) {
      Alert.alert("Missing Info", "Please select a food or fill in details manually");
      return;
    }

    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: foodName,
      portion: portion || "1 serving",
      calories: parseInt(calories) || 0,
      macros: {
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
      },
    };

    await addFoodToMeal(selectedMealType, newFood);

    setFoodName("");
    setPortion("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchModal(false);
  };



  const openEditModal = (mealType: MealType, item: FoodItem) => {
    setSelectedMealType(mealType);
    setEditingFood(item);
    setFoodName(item.name);
    setPortion(item.portion);
    setCalories(item.calories.toString());
    setProtein(item.macros.protein.toString());
    setCarbs(item.macros.carbs.toString());
    setFat(item.macros.fat.toString());
    setShowEditModal(true);
  };

  const handleEditFood = async () => {
    if (!selectedMealType || !editingFood || !foodName || !calories) {
      Alert.alert("Missing Info", "Please fill in at least food name and calories");
      return;
    }

    const updatedFood: FoodItem = {
      id: editingFood.id,
      name: foodName,
      portion: portion || "1 serving",
      calories: parseInt(calories) || 0,
      macros: {
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
      },
    };

    await updateFoodInMeal(selectedMealType, editingFood.id, updatedFood);

    setFoodName("");
    setPortion("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setShowEditModal(false);
    setSelectedMealType(null);
    setEditingFood(null);
  };

  const openGoalsModal = () => {
    setEditCalories(goals.targetCalories.toString());
    setEditProtein(goals.targetProtein.toString());
    setEditCarbs(goals.targetCarbs.toString());
    setEditFat(goals.targetFat.toString());
    setShowGoalsModal(true);
  };

  const handleSaveGoals = async () => {
    const newCalories = parseInt(editCalories);
    const newProtein = parseInt(editProtein);
    const newCarbs = parseInt(editCarbs);
    const newFat = parseInt(editFat);

    if (!newCalories || newCalories <= 0) {
      Alert.alert("Invalid Input", "Calories must be greater than 0");
      return;
    }

    if (newProtein < 0 || newCarbs < 0 || newFat < 0) {
      Alert.alert("Invalid Input", "Macros cannot be negative");
      return;
    }

    await updateGoals({
      targetCalories: newCalories,
      targetProtein: newProtein,
      targetCarbs: newCarbs,
      targetFat: newFat,
      waterGoal: goals.waterGoal,
      bottleSize: goals.bottleSize,
    });

    setShowGoalsModal(false);
    Alert.alert("Success", "Nutrition goals updated!");
  };

  const openWaterModal = () => {
    setEditWaterGoal(goals.waterGoal.toString());
    setEditBottleSize(goals.bottleSize.toString());
    setShowWaterModal(true);
  };

  const handleSaveWaterGoals = async () => {
    const newWaterGoal = parseInt(editWaterGoal);
    const newBottleSize = parseInt(editBottleSize);

    if (!newWaterGoal || newWaterGoal <= 0) {
      Alert.alert("Invalid Input", "Water goal must be greater than 0");
      return;
    }

    if (!newBottleSize || newBottleSize <= 0) {
      Alert.alert("Invalid Input", "Bottle size must be greater than 0");
      return;
    }

    await updateGoals({
      targetCalories: goals.targetCalories,
      targetProtein: goals.targetProtein,
      targetCarbs: goals.targetCarbs,
      targetFat: goals.targetFat,
      waterGoal: newWaterGoal,
      bottleSize: newBottleSize,
    });

    setShowWaterModal(false);
    Alert.alert("Success", "Water goals updated!");
  };

  const handleAddGlass = async () => {
    if (waterGlasses < goals.waterGoal) {
      await updateWaterIntake(waterGlasses + 1);
    }
  };

  const handleRemoveGlass = async () => {
    if (waterGlasses > 0) {
      await updateWaterIntake(waterGlasses - 1);
    }
  };

  const openWeightModal = () => {
    const latestWeight = getLatestWeight();
    if (latestWeight) {
      setWeightInput("");
      setWeightUnit(latestWeight.unit);
    } else {
      setWeightInput("");
      setWeightUnit("kg");
    }
    setShowWeightModal(true);
  };

  const handleLogWeight = async () => {
    const weight = parseFloat(weightInput);
    if (!weight || weight <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid weight");
      return;
    }
    await addWeightEntry(weight, weightUnit);
    setShowWeightModal(false);
    Alert.alert("Success", "Weight logged successfully!");
  };



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryAccent} />
      </View>
    );
  }

  const proteinPercent = Math.round(
    (nutrition.totalMacros.protein / (nutrition.targetMacros.protein || 1)) * 100,
  ) || 0;
  const carbsPercent = Math.round(
    (nutrition.totalMacros.carbs / (nutrition.targetMacros.carbs || 1)) * 100,
  ) || 0;
  const fatPercent = Math.round(
    (nutrition.totalMacros.fat / (nutrition.targetMacros.fat || 1)) * 100,
  ) || 0;

  const caloriesLeft = (nutrition.targetCalories || 0) - (nutrition.totalCalories || 0);
  const caloriesProgress = ((nutrition.totalCalories || 0) / (nutrition.targetCalories || 1)) * 100;
  const latestWeight = getLatestWeight();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={styles.dateNavigation}>
            <Pressable
              onPress={handlePreviousDay}
              style={styles.dateNavButton}
            >
              <ChevronLeft size={20} color="#212121" />
            </Pressable>
            <View style={styles.dateDisplay}>
              <Text style={styles.dayName}>{dayName}</Text>
              <Text style={styles.fullDate}>{fullDate}</Text>
            </View>
            <Pressable
              onPress={handleNextDay}
              style={[styles.dateNavButton, !canGoNext && styles.dateNavButtonDisabled]}
              disabled={!canGoNext}
            >
              <ChevronRight size={20} color={canGoNext ? "#212121" : "#E0E0E0"} />
            </Pressable>
          </View>

          <Pressable
            style={styles.editGoalsButton}
            onPress={openGoalsModal}
          >
            <Settings size={16} color="#4CAF50" />
            <Text style={styles.editGoalsText}>Edit Goals</Text>
          </Pressable>

          <View style={styles.caloriesDisplay}>
            <View style={styles.caloriesRow}>
              <Text style={styles.caloriesConsumed}>{nutrition.totalCalories}</Text>
              <Text style={styles.caloriesSeparator}> / </Text>
              <Text style={styles.caloriesTarget}>{nutrition.targetCalories} kcal</Text>
            </View>
            <Text style={styles.caloriesLeft}>{caloriesLeft} kcal left</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(caloriesProgress, 100)}%` }]} />
            </View>
          </View>

          <View style={styles.macrosGrid}>
            <View style={styles.macroCard}>
              <View style={styles.macroRingContainer}>
                <View style={[styles.macroRing, { borderColor: proteinPercent > 0 ? '#4CAF50' : '#E0E0E0' }]}>
                  <Text style={styles.macroPercent}>{proteinPercent}%</Text>
                </View>
              </View>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>
                {Math.round(nutrition.totalMacros.protein)}g/{nutrition.targetMacros.protein}g
              </Text>
            </View>

            <View style={styles.macroCard}>
              <View style={styles.macroRingContainer}>
                <View style={[styles.macroRing, { borderColor: carbsPercent > 0 ? '#4CAF50' : '#E0E0E0' }]}>
                  <Text style={styles.macroPercent}>{carbsPercent}%</Text>
                </View>
              </View>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>
                {Math.round(nutrition.totalMacros.carbs)}g/{nutrition.targetMacros.carbs}g
              </Text>
            </View>

            <View style={styles.macroCard}>
              <View style={styles.macroRingContainer}>
                <View style={[styles.macroRing, { borderColor: fatPercent > 0 ? '#4CAF50' : '#E0E0E0' }]}>
                  <Text style={styles.macroPercent}>{fatPercent}%</Text>
                </View>
              </View>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>
                {Math.round(nutrition.totalMacros.fat)}g/{nutrition.targetMacros.fat}g
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Pressable
              style={styles.statusItem}
              onPress={() => {
                const levels: ("low" | "medium" | "high")[] = ["low", "medium", "high"];
                const currentIndex = levels.indexOf(energyLevel);
                const nextLevel = levels[(currentIndex + 1) % levels.length];
                updateEnergyLevel(nextLevel);
              }}
            >
              <Zap size={26} color="#FFA726" fill="#FFA726" />
              <Text style={styles.statusLabel}>Energy</Text>
            </Pressable>

            <Pressable
              style={styles.statusItem}
              onPress={() => {
                const moods: ("bad" | "okay" | "good" | "great")[] = ["bad", "okay", "good", "great"];
                const currentIndex = moods.indexOf(mood);
                const nextMood = moods[(currentIndex + 1) % moods.length];
                updateMood(nextMood);
              }}
            >
              <Text style={styles.moodEmoji}>
                {mood === "bad" ? "😞" : mood === "okay" ? "😐" : mood === "good" ? "😊" : "😄"}
              </Text>
              <Text style={styles.statusLabel}>Mood</Text>
            </Pressable>

            <Pressable
              style={styles.statusItem}
              onPress={openWeightModal}
            >
              <Scale size={26} color="#5E35B1" />
              <Text style={styles.statusLabel}>Weight</Text>
              {latestWeight && (
                <Text style={styles.weightValue}>
                  {latestWeight.weight}{latestWeight.unit}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.waterSection}>
          <View style={styles.waterHeader}>
            <View style={styles.waterTitleRow}>
              <Droplets size={20} color="#007AFF" />
              <Text style={styles.waterTitle}>Water Intake</Text>
            </View>
            <Pressable onPress={openWaterModal} style={styles.waterEditButton}>
              <Settings size={16} color="#8E8E93" />
            </Pressable>
          </View>

          <View style={styles.waterContent}>
            <View style={styles.waterBottleContainer}>
              <View style={styles.waterBottle}>
                <View style={[styles.waterFill, { height: `${Math.min(((waterGlasses || 0) / (goals.waterGoal || 1)) * 100, 100)}%` }]} />
              </View>
            </View>

            <View style={styles.waterInfoContainer}>
              <Text style={styles.waterAmount}>
                {(((waterGlasses || 0) * (goals.bottleSize || 250)) / 1000).toFixed(2) || "0.00"}L
              </Text>
              <Text style={styles.waterGoalText}>
                Goal: {(((goals.waterGoal || 8) * (goals.bottleSize || 250)) / 1000).toFixed(2) || "2.00"}L ({goals.waterGoal || 8} × {goals.bottleSize || 250}ml glasses)
              </Text>

              <View style={styles.waterButtonsRow}>
                <Pressable
                  onPress={handleRemoveGlass}
                  style={[styles.waterButton, styles.waterButtonRemove]}
                  disabled={waterGlasses === 0}
                >
                  <Minus size={16} color={waterGlasses === 0 ? "#C7C7CC" : "#3A3A3C"} />
                  <Text style={[styles.waterButtonText, waterGlasses === 0 && styles.waterButtonTextDisabled]}>
                    Remove
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleAddGlass}
                  style={[styles.waterButton, styles.waterButtonAdd]}
                  disabled={waterGlasses >= goals.waterGoal}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.waterButtonTextAdd}>Add Glass</Text>
                </Pressable>
              </View>

              <View style={styles.waterProgressInfo}>
                <Text style={styles.waterProgressText}>{waterGlasses || 0}/{goals.waterGoal || 8} glasses</Text>
              </View>

              <View style={styles.waterProgressBarContainer}>
                <View style={styles.waterProgressBarBg}>
                  <View
                    style={[styles.waterProgressBarFill, { width: `${Math.min(((waterGlasses || 0) / (goals.waterGoal || 1)) * 100, 100)}%` }]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {insights.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>💡 Daily Insights</Text>
            {insights.map((insight) => (
              <View key={insight.id} style={styles.insightCard}>
                <Text style={styles.insightText}>{insight.message}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today&apos;s Meals</Text>

          {MEAL_TYPES.map(({ type, label, emoji }) => {
            const meal = nutrition.meals.find((m) => m.mealType === type);

            return (
              <View key={type} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealTitle}>
                    {emoji} {label}
                  </Text>
                  {meal && (
                    <Text style={styles.mealTotal}>
                      {meal.calories} kcal
                    </Text>
                  )}
                </View>

                {meal && meal.items.length > 0 ? (
                  <>
                    {meal.items.map((item) => (
                      <View key={item.id} style={styles.foodItem}>
                        <View style={styles.foodInfo}>
                          <Text style={styles.foodName}>{item.name}</Text>
                          <Text style={styles.foodPortion}>{item.portion}</Text>
                        </View>
                        <View style={styles.foodStats}>
                          <Text style={styles.foodCalories}>
                            {item.calories} kcal
                          </Text>
                          <Text style={styles.foodMacros}>
                            P:{item.macros.protein}g C:{item.macros.carbs}g F:
                            {item.macros.fat}g
                          </Text>
                        </View>
                        <View style={styles.foodActions}>
                          <Pressable
                            onPress={() => openEditModal(type, item)}
                            style={styles.editButton}
                          >
                            <Edit2 size={14} color="#4CAF50" />
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              const { isFavorite, favoriteId } = isFavoriteFood(item.name);
                              if (isFavorite && favoriteId) {
                                removeFavoriteFood(favoriteId);
                              } else {
                                addFavoriteFood({
                                  name: item.name,
                                  portion: item.portion,
                                  calories: item.calories,
                                  protein: item.macros.protein,
                                  carbs: item.macros.carbs,
                                  fat: item.macros.fat,
                                });
                              }
                            }}
                            style={styles.favoriteButton}
                          >
                            <Heart
                              size={14}
                              color={isFavoriteFood(item.name).isFavorite ? "#FF5252" : Colors.textSecondary}
                              fill={isFavoriteFood(item.name).isFavorite ? "#FF5252" : "transparent"}
                            />
                          </Pressable>
                          <Pressable
                            onPress={() => removeFoodFromMeal(type, item.id)}
                            style={styles.removeButton}
                          >
                            <X size={14} color={Colors.textSecondary} />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <Text style={styles.emptyMeal}>
                    No meal added yet 🍽️ Tap + to log
                  </Text>
                )}

                <View style={styles.mealActions}>
                  <Pressable
                    onPress={() => {
                      setSelectedMealType(type);
                      setShowAddOptionsModal(true);
                    }}
                    style={styles.addFoodMainButton}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.addFoodMainButtonText}>Add Food</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>



        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={showAddOptionsModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddOptionsModal(false)}
      >
        <Pressable
          style={styles.addOptionsOverlay}
          onPress={() => setShowAddOptionsModal(false)}
        >
          <View style={styles.addOptionsContainer}>
            <Text style={styles.addOptionsTitle}>
              Add to {selectedMealType ? MEAL_TYPES.find((m) => m.type === selectedMealType)?.label : "Meal"}
            </Text>

            <Pressable
              style={styles.addOptionItem}
              onPress={() => {
                setShowAddOptionsModal(false);
                if (selectedMealType) {
                  setShowFavoritesModal(true);
                }
              }}
            >
              <View style={[styles.addOptionIcon, { backgroundColor: Colors.primaryAccent }]}>
                <Heart size={20} color="#FFFFFF" />
              </View>
              <View style={styles.addOptionTextContainer}>
                <Text style={styles.addOptionLabel}>My Favorites</Text>
                <Text style={styles.addOptionDescription}>Your saved favorite foods</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.addOptionItem}
              onPress={() => {
                setShowAddOptionsModal(false);
                if (selectedMealType) {
                  setShowLibraryModal(true);
                }
              }}
            >
              <View style={[styles.addOptionIcon, { backgroundColor: Colors.primaryAccent }]}>
                <BookOpen size={20} color="#FFFFFF" />
              </View>
              <View style={styles.addOptionTextContainer}>
                <Text style={styles.addOptionLabel}>Food Library</Text>
                <Text style={styles.addOptionDescription}>200+ Indian foods with nutrition info</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.addOptionItem}
              onPress={() => {
                setShowAddOptionsModal(false);
                if (selectedMealType) {
                  setFoodName("");
                  setPortion("");
                  setCalories("");
                  setProtein("");
                  setCarbs("");
                  setFat("");
                  setShowAddModal(true);
                }
              }}
            >
              <View style={[styles.addOptionIcon, { backgroundColor: Colors.primaryAccent }]}>
                <Edit2 size={20} color="#FFFFFF" />
              </View>
              <View style={styles.addOptionTextContainer}>
                <Text style={styles.addOptionLabel}>Manual Entry</Text>
                <Text style={styles.addOptionDescription}>Enter food details yourself</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.addOptionItem}
              onPress={() => {
                setShowAddOptionsModal(false);
                if (selectedMealType) {
                  setSearchQuery("");
                  setSearchResults([]);
                  setFoodName("");
                  setPortion("");
                  setCalories("");
                  setProtein("");
                  setCarbs("");
                  setFat("");
                  setShowSearchModal(true);
                }
              }}
            >
              <View style={[styles.addOptionIcon, { backgroundColor: Colors.primaryAccent }]}>
                <Search size={20} color="#FFFFFF" />
              </View>
              <View style={styles.addOptionTextContainer}>
                <Text style={styles.addOptionLabel}>Online Search</Text>
                <Text style={styles.addOptionDescription}>Search 300,000+ foods from USDA database</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.addOptionCancel}
              onPress={() => setShowAddOptionsModal(false)}
            >
              <Text style={styles.addOptionCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Add Food to{" "}
                  {selectedMealType
                    ? MEAL_TYPES.find((m) => m.type === selectedMealType)?.label
                    : "Meal"}
                </Text>
                <Pressable
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalClose}
                >
                  <X size={24} color={Colors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.inputLabel}>Food Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Paneer Tikka"
                  value={foodName}
                  onChangeText={setFoodName}
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Portion</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 1 bowl, 200g"
                  value={portion}
                  onChangeText={setPortion}
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Calories *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 320"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 25"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 40"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 12"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Pressable
                  onPress={handleAddFood}
                  style={styles.addButton}
                  testID="add-food-button"
                >
                  <Check size={20} color={Colors.background} />
                  <Text style={styles.addButtonText}>Add Food</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Edit Food in{" "}
                  {selectedMealType
                    ? MEAL_TYPES.find((m) => m.type === selectedMealType)?.label
                    : "Meal"}
                </Text>
                <Pressable
                  onPress={() => setShowEditModal(false)}
                  style={styles.modalClose}
                >
                  <X size={24} color={Colors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.inputLabel}>Food Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Paneer Tikka"
                  value={foodName}
                  onChangeText={setFoodName}
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Portion</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 1 bowl, 200g"
                  value={portion}
                  onChangeText={setPortion}
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Calories *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 320"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 25"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 40"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 12"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Pressable
                  onPress={handleEditFood}
                  style={styles.addButton}
                  testID="edit-food-button"
                >
                  <Check size={20} color={Colors.background} />
                  <Text style={styles.addButtonText}>Save Changes</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showGoalsModal}
        animationType="slide"
        transparent
        onRequestClose={() => { setShowGoalsModal(false); setUseCalculator(false); }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {useCalculator ? "Calorie Calculator" : "Edit Nutrition Goals"}
                </Text>
                <Pressable
                  onPress={() => { setShowGoalsModal(false); setUseCalculator(false); }}
                  style={styles.modalClose}
                >
                  <X size={24} color={Colors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <View style={styles.calculatorToggle}>
                  <Pressable
                    onPress={() => setUseCalculator(false)}
                    style={[styles.toggleButton, !useCalculator && styles.toggleButtonActive]}
                  >
                    <Text style={[styles.toggleButtonText, !useCalculator && styles.toggleButtonTextActive]}>
                      Manual
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setUseCalculator(true)}
                    style={[styles.toggleButton, useCalculator && styles.toggleButtonActive]}
                  >
                    <Zap size={14} color={useCalculator ? "#FFFFFF" : "#FFC107"} />
                    <Text style={[styles.toggleButtonText, useCalculator && styles.toggleButtonTextActive]}>
                      Calculator
                    </Text>
                  </Pressable>
                </View>

                {useCalculator ? (
                  <>
                    <Text style={styles.calcSectionTitle}>Your Details</Text>

                    <Text style={styles.inputLabel}>Age *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 25"
                      value={calcAge}
                      onChangeText={setCalcAge}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Text style={styles.inputLabel}>Gender *</Text>
                    <View style={styles.unitSelector}>
                      <Pressable
                        onPress={() => setCalcGender("male")}
                        style={[styles.unitButton, calcGender === "male" && styles.unitButtonActive]}
                      >
                        <Text style={[styles.unitButtonText, calcGender === "male" && styles.unitButtonTextActive]}>
                          Male
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setCalcGender("female")}
                        style={[styles.unitButton, calcGender === "female" && styles.unitButtonActive]}
                      >
                        <Text style={[styles.unitButtonText, calcGender === "female" && styles.unitButtonTextActive]}>
                          Female
                        </Text>
                      </Pressable>
                    </View>

                    <Text style={styles.inputLabel}>Height *</Text>
                    <View style={styles.unitSelector}>
                      <Pressable
                        onPress={() => setCalcHeightUnit("cm")}
                        style={[styles.unitButton, calcHeightUnit === "cm" && styles.unitButtonActive]}
                      >
                        <Text style={[styles.unitButtonText, calcHeightUnit === "cm" && styles.unitButtonTextActive]}>
                          cm
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setCalcHeightUnit("ft")}
                        style={[styles.unitButton, calcHeightUnit === "ft" && styles.unitButtonActive]}
                      >
                        <Text style={[styles.unitButtonText, calcHeightUnit === "ft" && styles.unitButtonTextActive]}>
                          ft/in
                        </Text>
                      </Pressable>
                    </View>
                    {calcHeightUnit === "cm" ? (
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., 175"
                        value={calcHeight}
                        onChangeText={setCalcHeight}
                        keyboardType="numeric"
                        placeholderTextColor={Colors.textSecondary}
                      />
                    ) : (
                      <View style={styles.heightFtInRow}>
                        <TextInput
                          style={[styles.input, styles.heightInput]}
                          placeholder="ft"
                          value={calcHeightFeet}
                          onChangeText={setCalcHeightFeet}
                          keyboardType="numeric"
                          placeholderTextColor={Colors.textSecondary}
                        />
                        <TextInput
                          style={[styles.input, styles.heightInput]}
                          placeholder="in"
                          value={calcHeightInches}
                          onChangeText={setCalcHeightInches}
                          keyboardType="numeric"
                          placeholderTextColor={Colors.textSecondary}
                        />
                      </View>
                    )}

                    <Text style={styles.inputLabel}>Weight *</Text>
                    <View style={styles.unitSelector}>
                      <Pressable
                        onPress={() => setCalcWeightUnit("kg")}
                        style={[styles.unitButton, calcWeightUnit === "kg" && styles.unitButtonActive]}
                      >
                        <Text style={[styles.unitButtonText, calcWeightUnit === "kg" && styles.unitButtonTextActive]}>
                          kg
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setCalcWeightUnit("lbs")}
                        style={[styles.unitButton, calcWeightUnit === "lbs" && styles.unitButtonActive]}
                      >
                        <Text style={[styles.unitButtonText, calcWeightUnit === "lbs" && styles.unitButtonTextActive]}>
                          lbs
                        </Text>
                      </Pressable>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder={calcWeightUnit === "kg" ? "e.g., 70" : "e.g., 154"}
                      value={calcWeight}
                      onChangeText={setCalcWeight}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Text style={styles.calcSectionTitle}>Activity & Goals</Text>

                    <Text style={styles.inputLabel}>Activity Level *</Text>
                    <View style={styles.activityOptions}>
                      {(Object.keys(ACTIVITY_LABELS) as Array<keyof typeof ACTIVITY_LABELS>).map((level) => (
                        <Pressable
                          key={level}
                          onPress={() => setCalcActivityLevel(level)}
                          style={[styles.activityOption, calcActivityLevel === level && styles.activityOptionActive]}
                        >
                          <Text style={[styles.activityOptionText, calcActivityLevel === level && styles.activityOptionTextActive]}>
                            {ACTIVITY_LABELS[level]}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={styles.inputLabel}>Fitness Goal *</Text>
                    <View style={styles.goalOptions}>
                      {(Object.keys(GOAL_LABELS) as Array<keyof typeof GOAL_LABELS>).map((goal) => (
                        <Pressable
                          key={goal}
                          onPress={() => setCalcGoal(goal)}
                          style={[styles.goalOption, calcGoal === goal && styles.goalOptionActive]}
                        >
                          <Text style={[styles.goalOptionText, calcGoal === goal && styles.goalOptionTextActive]}>
                            {GOAL_LABELS[goal]}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Pressable
                      onPress={calculateCaloriesAndMacros}
                      style={styles.calculateButton}
                    >
                      <Zap size={20} color="#FFFFFF" />
                      <Text style={styles.calculateButtonText}>Calculate My Goals</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={styles.inputLabel}>Target Calories *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 2000"
                      value={editCalories}
                      onChangeText={setEditCalories}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Text style={styles.inputLabel}>Target Protein (g) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 150"
                      value={editProtein}
                      onChangeText={setEditProtein}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Text style={styles.inputLabel}>Target Carbs (g) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 200"
                      value={editCarbs}
                      onChangeText={setEditCarbs}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Text style={styles.inputLabel}>Target Fat (g) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 65"
                      value={editFat}
                      onChangeText={setEditFat}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Pressable
                      onPress={handleSaveGoals}
                      style={styles.addButton}
                      testID="save-goals-button"
                    >
                      <Check size={20} color={Colors.background} />
                      <Text style={styles.addButtonText}>Save Goals</Text>
                    </Pressable>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showWaterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWaterModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Water Goals</Text>
                <Pressable
                  onPress={() => setShowWaterModal(false)}
                  style={styles.modalClose}>
                  <X size={24} color={Colors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.inputLabel}>Daily Water Goal (glasses) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 8"
                  value={editWaterGoal}
                  onChangeText={setEditWaterGoal}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Bottle Size (ml) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 250"
                  value={editBottleSize}
                  onChangeText={setEditBottleSize}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />

                <View style={styles.waterGoalPreview}>
                  <Text style={styles.waterGoalPreviewText}>
                    Total Daily Goal: {(((parseInt(editWaterGoal || '0') || 0) * (parseInt(editBottleSize || '0') || 0)) / 1000).toFixed(2) || "0.00"}L
                  </Text>
                </View>

                <Pressable
                  onPress={handleSaveWaterGoals}
                  style={styles.addButton}
                  testID="save-water-goals-button">
                  <Check size={20} color={Colors.background} />
                  <Text style={styles.addButtonText}>Save Goals</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showWeightModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWeightModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Log Weight</Text>
                <Pressable
                  onPress={() => setShowWeightModal(false)}
                  style={styles.modalClose}>
                  <X size={24} color={Colors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                {latestWeight && (
                  <View style={styles.latestWeightCard}>
                    <Text style={styles.latestWeightLabel}>Last recorded:</Text>
                    <Text style={styles.latestWeightText}>
                      {latestWeight.weight} {latestWeight.unit}
                    </Text>
                    <Text style={styles.latestWeightDate}>
                      {new Date(latestWeight.loggedAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Weight *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 75"
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Unit</Text>
                <View style={styles.unitSelector}>
                  <Pressable
                    onPress={() => setWeightUnit("kg")}
                    style={[
                      styles.unitButton,
                      weightUnit === "kg" && styles.unitButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitButtonText,
                        weightUnit === "kg" && styles.unitButtonTextActive,
                      ]}
                    >
                      kg
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setWeightUnit("lbs")}
                    style={[
                      styles.unitButton,
                      weightUnit === "lbs" && styles.unitButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitButtonText,
                        weightUnit === "lbs" && styles.unitButtonTextActive,
                      ]}
                    >
                      lbs
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={handleLogWeight}
                  style={styles.addButton}
                  testID="log-weight-button">
                  <Check size={20} color={Colors.background} />
                  <Text style={styles.addButtonText}>Log Weight</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>





      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSearchModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Search Food Database
                  </Text>
                </View>
                <Pressable
                  onPress={() => setShowSearchModal(false)}
                  style={styles.modalClose}
                >
                  <X size={24} color={Colors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <View style={styles.searchInputContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search foods (e.g., chicken breast, apple)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    placeholderTextColor={Colors.textSecondary}
                    returnKeyType="search"
                  />
                  <Pressable
                    onPress={handleSearch}
                    style={styles.searchButton}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Search size={20} color="#FFFFFF" />
                    )}
                  </Pressable>
                </View>

                {searchResults.length > 0 && (
                  <View style={styles.searchResultsContainer}>
                    <Text style={styles.searchResultsTitle}>Select a food:</Text>
                    {searchResults.map((food) => (
                      <Pressable
                        key={food.id}
                        style={styles.searchResultItem}
                        onPress={() => selectSearchResult(food)}
                      >
                        <View style={styles.searchResultInfo}>
                          <Text style={styles.searchResultName} numberOfLines={2}>
                            {food.name}
                          </Text>
                          <Text style={styles.searchResultPortion}>{food.portion}</Text>
                        </View>
                        <View style={styles.searchResultNutrition}>
                          <Text style={styles.searchResultCalories}>{food.calories} kcal</Text>
                          <Text style={styles.searchResultMacros}>
                            P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}

                {foodName !== "" && (
                  <>
                    <Text style={styles.selectedFoodTitle}>Selected Food</Text>

                    <Text style={styles.inputLabel}>Food Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Food name"
                      value={foodName}
                      onChangeText={setFoodName}
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Text style={styles.inputLabel}>Portion</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 100g, 1 cup"
                      value={portion}
                      onChangeText={setPortion}
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Text style={styles.inputLabel}>Calories *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 200"
                      value={calories}
                      onChangeText={setCalories}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Text style={styles.inputLabel}>Protein (g)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 25"
                      value={protein}
                      onChangeText={setProtein}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Text style={styles.inputLabel}>Carbs (g)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 40"
                      value={carbs}
                      onChangeText={setCarbs}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Text style={styles.inputLabel}>Fat (g)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 12"
                      value={fat}
                      onChangeText={setFat}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <Pressable
                      onPress={handleAddSearchFood}
                      style={styles.addButton}
                    >
                      <Check size={20} color={Colors.background} />
                      <Text style={styles.addButtonText}>Add Food</Text>
                    </Pressable>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showFavoritesModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFavoritesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Favorites</Text>
              <Pressable
                onPress={() => setShowFavoritesModal(false)}
                style={styles.modalClose}
              >
                <X size={24} color={Colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {favoriteFoods.length > 0 ? (
                favoriteFoods.map((fav) => (
                  <Pressable
                    key={fav.id}
                    style={styles.searchResultItem}
                    onPress={async () => {
                      if (selectedMealType) {
                        const newFood: FoodItem = {
                          id: Date.now().toString(),
                          name: fav.name,
                          portion: fav.portion,
                          calories: fav.calories,
                          macros: {
                            protein: fav.protein || 0,
                            carbs: fav.carbs || 0,
                            fat: fav.fat || 0,
                          },
                        };
                        await addFoodToMeal(selectedMealType, newFood);
                        setShowFavoritesModal(false);
                        setSelectedMealType(null);
                      }
                    }}
                  >
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultName}>{fav.name}</Text>
                      <Text style={styles.searchResultPortion}>{fav.portion}</Text>
                    </View>
                    <View style={styles.searchResultNutrition}>
                      <Text style={styles.searchResultCalories}>{fav.calories} kcal</Text>
                      <Text style={styles.searchResultMacros}>
                        P:{fav.protein || 0}g C:{fav.carbs || 0}g F:{fav.fat || 0}g
                      </Text>
                    </View>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        removeFavoriteFood(fav.id);
                      }}
                      style={styles.removeButton}
                    >
                      <X size={14} color={Colors.textSecondary} />
                    </Pressable>
                  </Pressable>
                ))
              ) : (
                <View style={styles.emptyFavorites}>
                  <Heart size={48} color="#E0E0E0" />
                  <Text style={styles.emptyFavoritesText}>No favorites yet</Text>
                  <Text style={styles.emptyFavoritesHint}>
                    Tap the heart icon on any food to add it to your favorites
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLibraryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLibraryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Food Library</Text>
              <Pressable
                onPress={() => {
                  setShowLibraryModal(false);
                  setLibrarySearchQuery("");
                }}
                style={styles.modalClose}
              >
                <X size={24} color={Colors.text} />
              </Pressable>
            </View>

            <View style={styles.searchInputContainer}>
              <Search size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search 200+ Indian foods..."
                value={librarySearchQuery}
                onChangeText={setLibrarySearchQuery}
                placeholderTextColor={Colors.textSecondary}
              />
              {librarySearchQuery.length > 0 && (
                <Pressable onPress={() => setLibrarySearchQuery("")}>
                  <X size={18} color={Colors.textSecondary} />
                </Pressable>
              )}
            </View>

            <ScrollView style={styles.modalScroll}>
              {(() => {
                const allMeals = mealLibrary.flatMap(cuisine =>
                  cuisine.categories.flatMap(cat => cat.meals)
                );
                const filteredMeals = librarySearchQuery.length > 0
                  ? allMeals.filter(meal =>
                    meal.name.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                    meal.cuisine.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                    meal.tags.some(tag => tag.toLowerCase().includes(librarySearchQuery.toLowerCase()))
                  )
                  : allMeals.slice(0, 50);

                if (filteredMeals.length === 0) {
                  return (
                    <View style={styles.emptyFavorites}>
                      <BookOpen size={48} color="#E0E0E0" />
                      <Text style={styles.emptyFavoritesText}>No foods found</Text>
                      <Text style={styles.emptyFavoritesHint}>
                        Try searching for a different food
                      </Text>
                    </View>
                  );
                }

                return filteredMeals.map((meal) => {
                  const { isFavorite, favoriteId } = isFavoriteFood(meal.name);
                  return (
                    <Pressable
                      key={meal.id}
                      style={styles.searchResultItem}
                      onPress={async () => {
                        if (selectedMealType) {
                          const newFood: FoodItem = {
                            id: Date.now().toString(),
                            name: meal.name,
                            portion: meal.portion,
                            calories: meal.calories,
                            macros: {
                              protein: meal.macros.protein,
                              carbs: meal.macros.carbs,
                              fat: meal.macros.fat,
                            },
                          };
                          await addFoodToMeal(selectedMealType, newFood);
                          setShowLibraryModal(false);
                          setLibrarySearchQuery("");
                          setSelectedMealType(null);
                        }
                      }}
                    >
                      <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultName}>{meal.name}</Text>
                        <Text style={styles.searchResultPortion}>{meal.portion} • {meal.cuisine}</Text>
                      </View>
                      <View style={styles.searchResultNutrition}>
                        <Text style={styles.searchResultCalories}>{meal.calories} kcal</Text>
                        <Text style={styles.searchResultMacros}>
                          P:{meal.macros.protein}g C:{meal.macros.carbs}g F:{meal.macros.fat}g
                        </Text>
                      </View>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          if (isFavorite && favoriteId) {
                            removeFavoriteFood(favoriteId);
                          } else {
                            addFavoriteFood({
                              name: meal.name,
                              portion: meal.portion,
                              calories: meal.calories,
                              protein: meal.macros.protein,
                              carbs: meal.macros.carbs,
                              fat: meal.macros.fat,
                            });
                          }
                        }}
                        style={styles.favoriteButton}
                      >
                        <Heart
                          size={18}
                          color={isFavorite ? "#FF5252" : "#E0E0E0"}
                          fill={isFavorite ? "#FF5252" : "transparent"}
                        />
                      </Pressable>
                    </Pressable>
                  );
                });
              })()
              }
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  topSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: Platform.OS === 'android' ? 16 : 24,
    borderBottomRightRadius: Platform.OS === 'android' ? 16 : 24,
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: Platform.OS === 'android' ? 6 : 4,
  },
  dateNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  dateNavButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
  },
  dateNavButtonDisabled: {
    opacity: 0.3,
  },
  dateDisplay: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  dayName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFC107",
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  fullDate: {
    fontSize: 11,
    color: "#B0B0B0",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  editGoalsButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
    marginBottom: 16,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  editGoalsText: {
    fontSize: 12,
    color: "#FFC107",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  caloriesDisplay: {
    alignItems: "center",
    marginBottom: 12,
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 6,
  },
  caloriesConsumed: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFC107",
    letterSpacing: -2,
  },
  caloriesSeparator: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "400",
    marginHorizontal: 3,
  },
  caloriesTarget: {
    fontSize: 16,
    color: "#B0B0B0",
    fontWeight: "700",
  },
  caloriesLeft: {
    fontSize: 12,
    color: "#FFC107",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  progressBarContainer: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: "#F5F5F5",
    borderRadius: 2.5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFC107",
    borderRadius: 2.5,
  },
  macrosGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  macroCard: {
    alignItems: "center",
    flex: 1,
  },
  macroRingContainer: {
    marginBottom: 8,
  },
  macroRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  macroPercent: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFC107",
    letterSpacing: -0.5,
  },
  macroLabel: {
    fontSize: 10,
    color: "#B0B0B0",
    marginBottom: 3,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  macroValue: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 10,
  },
  statusItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1,
  },
  statusLabel: {
    fontSize: 10,
    color: "#B0B0B0",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  moodEmoji: {
    fontSize: 26,
  },
  insightsSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFC107",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  insightCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  insightText: {
    fontSize: 13,
    color: "#333333",
    lineHeight: 18,
  },
  mealsSection: {
    marginHorizontal: 16,
    marginTop: 18,
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333333",
  },
  mealTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFC107",
  },
  foodItem: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 3,
  },
  foodPortion: {
    fontSize: 12,
    color: "#B0B0B0",
    fontWeight: "500",
  },
  foodStats: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  foodCalories: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFC107",
    marginBottom: 2,
  },
  foodMacros: {
    fontSize: 10,
    color: "#B0B0B0",
    fontWeight: "500",
  },
  foodActions: {
    flexDirection: "row",
    gap: 4,
  },
  editButton: {
    padding: 5,
    borderRadius: 6,
    backgroundColor: "#F5F5F5",
  },
  favoriteButton: {
    padding: 5,
    borderRadius: 6,
    backgroundColor: "#F5F5F5",
  },
  removeButton: {
    padding: 5,
    borderRadius: 6,
    backgroundColor: "#F5F5F5",
  },
  emptyFavorites: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyFavoritesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#888888",
    marginTop: 16,
  },
  emptyFavoritesHint: {
    fontSize: 14,
    color: "#B0B0B0",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  emptyMeal: {
    fontSize: 13,
    color: "#B0B0B0",
    textAlign: "center",
    paddingVertical: 18,
    fontWeight: "500",
  },
  mealActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFC107",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonTextDisabled: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  actionButtonTextSecondary: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B0B0B0",
  },
  addFoodMainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#FFC107",
    flex: 1,
  },
  addFoodMainButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addOptionsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addOptionsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 340,
  },
  addOptionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 20,
  },
  addOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    marginBottom: 10,
  },
  addOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  addOptionTextContainer: {
    flex: 1,
  },
  addOptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  addOptionDescription: {
    fontSize: 12,
    color: "#888888",
  },
  addOptionCancel: {
    marginTop: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  addOptionCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888888",
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: Platform.OS === 'android' ? 20 : 24,
    borderTopRightRadius: Platform.OS === 'android' ? 20 : 24,
    maxHeight: "85%",
    elevation: Platform.OS === 'android' ? 16 : 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFC107",
  },
  modalClose: {
    padding: 4,
  },
  modalScroll: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? 12 : 14,
    fontSize: 16,
    color: "#333333",
    marginBottom: 18,
    borderRadius: Platform.OS === 'android' ? 8 : 12,
    backgroundColor: "#F5F5F5",
    textAlignVertical: Platform.OS === 'android' ? 'top' : 'auto',
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#FFC107",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    borderRadius: 14,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
  },
  waterSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  waterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  waterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFC107",
  },
  waterEditButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  waterContent: {
    flexDirection: "row",
    gap: 16,
  },
  waterBottleContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  waterBottle: {
    width: 60,
    height: 140,
    borderWidth: 3,
    borderColor: "#FFC107",
    borderRadius: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFC107",
  },
  waterInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  waterAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFC107",
    marginBottom: 4,
    letterSpacing: -1,
  },
  waterGoalText: {
    fontSize: 11,
    color: "#B0B0B0",
    marginBottom: 12,
    fontWeight: "500",
  },
  waterButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  waterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
  },
  waterButtonRemove: {
    backgroundColor: "#F5F5F5",
  },
  waterButtonAdd: {
    backgroundColor: "#FFC107",
  },
  waterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
  },
  waterButtonTextDisabled: {
    color: "#666666",
  },
  waterButtonTextAdd: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
  waterProgressInfo: {
    marginBottom: 6,
  },
  waterProgressText: {
    fontSize: 11,
    color: "#B0B0B0",
    fontWeight: "600",
  },
  waterProgressBarContainer: {
    marginTop: 4,
  },
  waterProgressBarBg: {
    height: 6,
    backgroundColor: "#F5F5F5",
    borderRadius: 3,
    overflow: "hidden",
  },
  waterProgressBarFill: {
    height: "100%",
    backgroundColor: "#FFC107",
    borderRadius: 3,
  },
  waterGoalPreview: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  waterGoalPreviewText: {
    fontSize: 14,
    color: "#FFC107",
    fontWeight: "600",
    textAlign: "center",
  },
  weightValue: {
    fontSize: 10,
    color: "#FFC107",
    fontWeight: "700",
    marginTop: 2,
  },
  latestWeightCard: {
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  latestWeightLabel: {
    fontSize: 11,
    color: "#B0B0B0",
    fontWeight: "600",
    marginBottom: 4,
  },
  latestWeightText: {
    fontSize: 28,
    color: "#FFC107",
    fontWeight: "800",
    marginBottom: 4,
  },
  latestWeightDate: {
    fontSize: 11,
    color: "#B0B0B0",
    fontWeight: "500",
  },
  unitSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  unitButtonActive: {
    backgroundColor: "#3A3A00",
    borderColor: "#FFC107",
  },
  unitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#B0B0B0",
  },
  unitButtonTextActive: {
    color: "#FFC107",
    fontWeight: "700",
  },
  photoPickerSection: {
    paddingVertical: 20,
  },
  photoPickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 20,
    textAlign: "center",
  },
  photoPickerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  photoPickerButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "#FFC107",
    borderRadius: 16,
    gap: 8,
  },
  photoPickerButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  photoPreviewSection: {
    marginBottom: 20,
  },
  photoPreview: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
  },
  changePhotoButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  changePhotoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B0B0B0",
  },
  analyzingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 16,
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFC107",
  },
  aiResultsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFC107",
    marginBottom: 4,
  },
  aiResultsSubtitle: {
    fontSize: 13,
    color: "#B0B0B0",
    marginBottom: 20,
  },
  voiceRecordSection: {
    paddingVertical: 20,
    alignItems: "center",
  },
  voiceRecordTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  voiceRecordSubtitle: {
    fontSize: 13,
    color: "#B0B0B0",
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  voiceRecordButtonContainer: {
    marginVertical: 20,
  },
  voiceRecordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFC107",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  voiceRecordButtonActive: {
    backgroundColor: "#FF3B30",
    shadowColor: "#FF3B30",
  },
  voiceRecordStatus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B0B0B0",
    textAlign: "center",
  },
  transcribedSection: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  transcribedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFC107",
    marginBottom: 8,
  },
  transcribedText: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 22,
    fontStyle: "italic",
    marginBottom: 12,
  },
  retryRecordButton: {
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  retryRecordButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFC107",
  },
  freeLabel: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 2,
  },
  searchInputContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#333333",
  },
  searchButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  searchResultsContainer: {
    marginBottom: 20,
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  searchResultBrand: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 2,
  },
  searchResultPortion: {
    fontSize: 12,
    color: "#666666",
  },
  searchResultNutrition: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  searchResultCalories: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFC107",
    marginBottom: 2,
  },
  searchResultMacros: {
    fontSize: 11,
    color: "#888888",
  },
  selectedFoodTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 16,
    marginTop: 8,
  },
  calculatorToggle: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: "#FFC107",
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  toggleButtonTextActive: {
    color: "#FFFFFF",
  },
  calcSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFC107",
    marginTop: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  heightFtInRow: {
    flexDirection: "row",
    gap: 12,
  },
  heightInput: {
    flex: 1,
  },
  activityOptions: {
    marginBottom: 24,
  },
  activityOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  activityOptionActive: {
    backgroundColor: "#3A3A00",
    borderColor: "#FFC107",
  },
  activityOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  activityOptionTextActive: {
    color: "#FFC107",
    fontWeight: "600",
  },
  goalOptions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  goalOption: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  goalOptionActive: {
    backgroundColor: "#3A3A00",
    borderColor: "#FFC107",
  },
  goalOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
    textAlign: "center",
  },
  goalOptionTextActive: {
    color: "#FFC107",
    fontWeight: "700",
  },
  calculateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFC107",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
