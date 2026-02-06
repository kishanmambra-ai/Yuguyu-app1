import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDiet } from "@/contexts/DietContext";
import { useWorkouts } from "@/contexts/WorkoutContext";
import Colors from "@/constants/colors";
import { Calendar } from "react-native-calendars";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Dumbbell, UtensilsCrossed, Droplet, Heart, Zap } from "lucide-react-native";
import { WorkoutHistory, CardioActivity } from "@/types/workout";
import { MealLog } from "@/types/diet";

type MarkedDates = {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
};

const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CalendarScreen() {
  const { loadDateData, meals, waterGlasses, mood, energyLevel, goals } = useDiet();
  const { history, cardioHistory } = useWorkouts();
  const [selectedDate, setSelectedDate] = useState<string>(
    getLocalDateString()
  );
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dayWorkouts, setDayWorkouts] = useState<WorkoutHistory[]>([]);
  const [dayCardio, setDayCardio] = useState<CardioActivity[]>([]);

  const loadHistoricalMarkers = useCallback(async () => {
    try {
      const mealsData = await AsyncStorage.getItem("yuguyu_meals");
      let allMeals: MealLog[] = [];
      
      if (mealsData && mealsData !== 'undefined' && mealsData !== 'null') {
        try {
          const trimmed = mealsData.trim();
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            const parsed = JSON.parse(mealsData);
            allMeals = Array.isArray(parsed) ? parsed : [];
          } else {
            console.error("Invalid meals data format, clearing");
            await AsyncStorage.removeItem("yuguyu_meals");
          }
        } catch (parseError) {
          console.error("Failed to parse meals data:", parseError);
          await AsyncStorage.removeItem("yuguyu_meals");
          allMeals = [];
        }
      }

      const marked: MarkedDates = {};
      
      const mealDates = new Set(allMeals.map((m: MealLog) => m.date));
      const workoutDates = new Set(history.map((w) => w.completedAt.split("T")[0]));
      const cardioDates = new Set(
        cardioHistory
          .map((c) => c.completedAt?.split("T")[0])
          .filter((date): date is string => date !== undefined)
      );

      const allDates = new Set([...mealDates, ...workoutDates, ...cardioDates]);

      allDates.forEach((date: string) => {
        const hasMeals = mealDates.has(date);
        const hasWorkouts = workoutDates.has(date);
        const hasCardio = cardioDates.has(date);

        marked[date] = {
          marked: true,
          dotColor: hasMeals && (hasWorkouts || hasCardio) 
            ? Colors.success 
            : hasMeals 
            ? Colors.secondaryAccent 
            : Colors.primaryAccent,
        };
      });

      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: Colors.primaryAccent,
      };

      setMarkedDates(marked);
    } catch (error) {
      console.error("Failed to load markers:", error);
    }
  }, [history, cardioHistory, selectedDate]);

  const loadSelectedDateData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const date = new Date(selectedDate + "T00:00:00");
      await loadDateData(date);

      const dayWorkoutHistory = history.filter(
        (w) => w.completedAt.split("T")[0] === selectedDate
      );
      const dayCardioHistory = cardioHistory.filter(
        (c) => c.completedAt?.split("T")[0] === selectedDate
      );

      setDayWorkouts(dayWorkoutHistory);
      setDayCardio(dayCardioHistory);
    } catch (error) {
      console.error("Failed to load date data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedDate, loadDateData, history, cardioHistory]);

  useEffect(() => {
    loadHistoricalMarkers();
  }, [loadHistoricalMarkers]);

  useEffect(() => {
    loadSelectedDateData();
  }, [loadSelectedDateData]);

  const onDayPress = useCallback((day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    
    const newMarked = { ...markedDates };
    Object.keys(newMarked).forEach((key) => {
      newMarked[key] = {
        ...newMarked[key],
        selected: false,
      };
    });
    
    newMarked[day.dateString] = {
      ...newMarked[day.dateString],
      selected: true,
      selectedColor: Colors.primaryAccent,
      marked: newMarked[day.dateString]?.marked || false,
      dotColor: newMarked[day.dateString]?.dotColor || Colors.primaryAccent,
    };
    
    setMarkedDates(newMarked);
  }, [markedDates]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T12:00:00");
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayString = getLocalDateString(today);
    const yesterdayString = getLocalDateString(yesterday);

    if (dateString === todayString) return "Today";
    if (dateString === yesterdayString) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.macros.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.macros.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.macros.fat, 0);

  const hasData = meals.length > 0 || dayWorkouts.length > 0 || dayCardio.length > 0;

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: Colors.background,
          calendarBackground: Colors.background,
          textSectionTitleColor: Colors.textSecondary,
          selectedDayBackgroundColor: Colors.primaryAccent,
          selectedDayTextColor: Colors.background,
          todayTextColor: Colors.primaryAccent,
          dayTextColor: Colors.text,
          textDisabledColor: Colors.textSecondary + "40",
          dotColor: Colors.primaryAccent,
          selectedDotColor: Colors.background,
          arrowColor: Colors.primaryAccent,
          monthTextColor: Colors.text,
          textDayFontWeight: "500",
          textMonthFontWeight: "600",
          textDayHeaderFontWeight: "600",
          textDayFontSize: 15,
          textMonthFontSize: 17,
          textDayHeaderFontSize: 13,
        }}
        style={styles.calendar}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateTitle}>{formatDate(selectedDate)}</Text>
        </View>

        {isLoadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryAccent} />
          </View>
        ) : !hasData ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data for this day</Text>
            <Text style={styles.emptySubtext}>
              Start logging your meals and workouts to see them here
            </Text>
          </View>
        ) : (
          <>
            {meals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <UtensilsCrossed color={Colors.secondaryAccent} size={22} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Diet</Text>
                </View>

                <View style={styles.nutritionSummary}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(totalCalories)}</Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(totalProtein)}g</Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(totalCarbs)}g</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(totalFat)}g</Text>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                  </View>
                </View>

                {meals.map((meal) => (
                  <View key={meal.id} style={styles.mealCard}>
                    <Text style={styles.mealType}>{meal.mealType}</Text>
                    {meal.items.map((item) => (
                      <View key={item.id} style={styles.foodItem}>
                        <Text style={styles.foodName}>{item.name}</Text>
                        <Text style={styles.foodCalories}>{item.calories} cal</Text>
                      </View>
                    ))}
                  </View>
                ))}

                <View style={styles.trackerRow}>
                  <View style={styles.trackerItem}>
                    <Droplet color={Colors.info} size={20} strokeWidth={2} />
                    <Text style={styles.trackerText}>
                      {waterGlasses}/{goals.waterGoal} glasses
                    </Text>
                  </View>
                  <View style={styles.trackerItem}>
                    <Heart color={Colors.error} size={20} strokeWidth={2} />
                    <Text style={styles.trackerText}>{mood}</Text>
                  </View>
                  <View style={styles.trackerItem}>
                    <Zap color={Colors.warning} size={20} strokeWidth={2} />
                    <Text style={styles.trackerText}>{energyLevel}</Text>
                  </View>
                </View>
              </View>
            )}

            {dayWorkouts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Dumbbell color={Colors.primaryAccent} size={22} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Strength Workouts</Text>
                </View>

                {dayWorkouts.map((workout) => (
                  <View key={workout.id} style={styles.workoutCard}>
                    <Text style={styles.workoutName}>{workout.routineName}</Text>
                    <View style={styles.workoutStats}>
                      <Text style={styles.workoutStat}>{workout.totalSets} sets</Text>
                      <Text style={styles.workoutStat}>{workout.totalReps} reps</Text>
                      <Text style={styles.workoutStat}>
                        {workout.exercises.length} exercises
                      </Text>
                    </View>
                    <View style={styles.exerciseList}>
                      {workout.exercises.map((ex) => (
                        <Text key={ex.id} style={styles.exerciseName}>
                          • {ex.name}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {dayCardio.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Dumbbell color={Colors.success} size={22} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Cardio Activities</Text>
                </View>

                {dayCardio.map((cardio) => (
                  <View key={cardio.id} style={styles.cardioCard}>
                    <Text style={styles.cardioType}>{cardio.type}</Text>
                    <View style={styles.cardioStats}>
                      <View style={styles.cardioStat}>
                        <Text style={styles.cardioValue}>
                          {(cardio.distance / 1000).toFixed(2)}
                        </Text>
                        <Text style={styles.cardioLabel}>km</Text>
                      </View>
                      <View style={styles.cardioStat}>
                        <Text style={styles.cardioValue}>
                          {Math.floor(cardio.duration / 60000)}
                        </Text>
                        <Text style={styles.cardioLabel}>min</Text>
                      </View>
                      <View style={styles.cardioStat}>
                        <Text style={styles.cardioValue}>
                          {cardio.averageSpeed?.toFixed(1) || 0}
                        </Text>
                        <Text style={styles.cardioLabel}>km/h</Text>
                      </View>
                      {cardio.steps !== undefined && cardio.steps > 0 && (
                        <View style={styles.cardioStat}>
                          <Text style={styles.cardioValue}>{cardio.steps}</Text>
                          <Text style={styles.cardioLabel}>steps</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  content: {
    flex: 1,
  },
  dateHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  nutritionSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  mealCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  mealType: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
    textTransform: "capitalize",
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  foodName: {
    fontSize: 14,
    color: Colors.text,
  },
  foodCalories: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  trackerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  trackerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trackerText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
  },
  workoutCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  workoutStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  workoutStat: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  exerciseList: {
    gap: 6,
  },
  exerciseName: {
    fontSize: 14,
    color: Colors.text,
  },
  cardioCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardioType: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
    textTransform: "capitalize",
  },
  cardioStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cardioStat: {
    alignItems: "center",
  },
  cardioValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  cardioLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
