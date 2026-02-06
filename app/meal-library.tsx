import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Plus, Search, X } from "lucide-react-native";
import { useState, useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import mealLibrary, { LibraryMeal } from "@/constants/meal-library";
import { useDiet } from "@/contexts/DietContext";
import { MealType } from "@/types/diet";

export default function MealLibraryScreen() {
  const params = useLocalSearchParams();
  const mealType = params.mealType as MealType | undefined;
  const insets = useSafeAreaInsets();
  const { addFoodToMeal } = useDiet();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const cuisines = mealLibrary.map((cg) => ({
    id: cg.id,
    name: cg.name,
  }));

  const categories = useMemo(() => {
    if (!selectedCuisine) return [];
    const cg = mealLibrary.find((c) => c.id === selectedCuisine);
    return cg?.categories.map((c) => ({ id: c.id, name: c.name })) || [];
  }, [selectedCuisine]);

  const allMeals = useMemo(() => {
    const meals: LibraryMeal[] = [];
    mealLibrary.forEach((cg) => {
      cg.categories.forEach((cat) => {
        meals.push(...cat.meals);
      });
    });
    return meals;
  }, []);

  const filteredMeals = useMemo(() => {
    let filtered = allMeals;

    if (selectedCuisine) {
      filtered = filtered.filter(
        (meal) => meal.cuisine === mealLibrary.find((cg) => cg.id === selectedCuisine)?.name
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((meal) => {
        const category = mealLibrary
          .flatMap((cg) => cg.categories)
          .find((c) => c.id === selectedCategory);
        return meal.mealCategory === category?.name;
      });
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((meal) =>
        meal.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [allMeals, selectedCuisine, selectedCategory, searchQuery]);

  const handleMealSelect = async (meal: LibraryMeal) => {
    if (mealType) {
      await addFoodToMeal(mealType, {
        id: Date.now().toString(),
        name: meal.name,
        portion: meal.portion,
        calories: meal.calories,
        macros: meal.macros,
      });
      Alert.alert("Success", `${meal.name} added to ${mealType}`);
      router.back();
    } else {
      Alert.alert(
        "Select Meal Time",
        "Choose when to add this meal",
        [
          {
            text: "Breakfast",
            onPress: async () => {
              await addFoodToMeal("breakfast", {
                id: Date.now().toString(),
                name: meal.name,
                portion: meal.portion,
                calories: meal.calories,
                macros: meal.macros,
              });
              Alert.alert("Success", `${meal.name} added to breakfast`);
              router.back();
            },
          },
          {
            text: "Lunch",
            onPress: async () => {
              await addFoodToMeal("lunch", {
                id: Date.now().toString(),
                name: meal.name,
                portion: meal.portion,
                calories: meal.calories,
                macros: meal.macros,
              });
              Alert.alert("Success", `${meal.name} added to lunch`);
              router.back();
            },
          },
          {
            text: "Dinner",
            onPress: async () => {
              await addFoodToMeal("dinner", {
                id: Date.now().toString(),
                name: meal.name,
                portion: meal.portion,
                calories: meal.calories,
                macros: meal.macros,
              });
              Alert.alert("Success", `${meal.name} added to dinner`);
              router.back();
            },
          },
          {
            text: "Snacks",
            onPress: async () => {
              await addFoodToMeal("snacks", {
                id: Date.now().toString(),
                name: meal.name,
                portion: meal.portion,
                calories: meal.calories,
                macros: meal.macros,
              });
              Alert.alert("Success", `${meal.name} added to snacks`);
              router.back();
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    }
  };

  const clearFilters = () => {
    setSelectedCuisine("");
    setSelectedCategory("");
    setSearchQuery("");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFD700" />
        </Pressable>
        <Text style={styles.headerTitle}>Meal Library</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search meals..."
            placeholderTextColor={Colors.textSecondary}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.filtersSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={cuisines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.filterChip,
                selectedCuisine === item.id && styles.filterChipActive,
                pressed && styles.filterChipPressed,
              ]}
              onPress={() => {
                setSelectedCuisine(
                  selectedCuisine === item.id ? "" : item.id
                );
                setSelectedCategory("");
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCuisine === item.id &&
                    styles.filterChipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {selectedCuisine && categories.length > 0 && (
        <View style={styles.categoriesSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.categoryChip,
                  selectedCategory === item.id && styles.categoryChipActive,
                  pressed && styles.filterChipPressed,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === item.id ? "" : item.id
                  )
                }
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === item.id &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {(selectedCuisine || selectedCategory || searchQuery) && (
        <View style={styles.clearFiltersSection}>
          <Pressable
            style={({ pressed }) => [
              styles.clearFiltersButton,
              pressed && styles.clearFiltersButtonPressed,
            ]}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.mealsList}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.mealCard,
              pressed && styles.mealCardPressed,
            ]}
            onPress={() => handleMealSelect(item)}
          >
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{item.name}</Text>
              <Text style={styles.mealDetails}>
                {item.cuisine} {item.mealCategory && `• ${item.mealCategory}`}
              </Text>
              <Text style={styles.mealMacros}>
                {item.calories} kcal • P:{item.macros.protein}g C:{item.macros.carbs}g F:{item.macros.fat}g
              </Text>
              <View style={styles.tagsRow}>
                {item.tags.slice(0, 2).map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Plus size={20} color="#FFD700" />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No meals found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your filters or search
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    borderRadius: 10,
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFD700",
  },
  searchSection: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  filtersSection: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 4,
  },
  filtersList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterChipActive: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  filterChipPressed: {
    opacity: 0.6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  filterChipTextActive: {
    color: "#000000",
  },
  categoriesSection: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryChipActive: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
  categoryChipTextActive: {
    color: "#000000",
  },
  clearFiltersSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  clearFiltersButton: {
    padding: 8,
    alignSelf: "flex-start",
  },
  clearFiltersButtonPressed: {
    opacity: 0.6,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFD700",
  },
  mealsList: {
    padding: 16,
    gap: 12,
  },
  mealCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  mealCardPressed: {
    backgroundColor: "#E8E8E8",
  },
  mealInfo: {
    flex: 1,
    marginRight: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 6,
  },
  mealDetails: {
    fontSize: 13,
    color: "#888888",
    marginBottom: 5,
    fontWeight: "500",
  },
  mealMacros: {
    fontSize: 12,
    color: "#FFD700",
    marginBottom: 8,
    fontWeight: "500",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: "#888888",
    fontWeight: "500",
  },
});
