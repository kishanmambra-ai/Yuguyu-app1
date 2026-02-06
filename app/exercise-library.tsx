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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import exerciseLibrary, { LibraryExercise } from "@/constants/exercise-library";

export default function ExerciseLibraryScreen() {
  const params = useLocalSearchParams();
  const onSelectCallback = params.onSelect as string | undefined;
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const muscleGroups = exerciseLibrary.map((mg) => ({
    id: mg.id,
    name: mg.name,
  }));

  const categories = useMemo(() => {
    if (!selectedMuscleGroup) return [];
    const mg = exerciseLibrary.find((m) => m.id === selectedMuscleGroup);
    return mg?.categories.map((c) => ({ id: c.id, name: c.name })) || [];
  }, [selectedMuscleGroup]);

  const allExercises = useMemo(() => {
    const exercises: LibraryExercise[] = [];
    exerciseLibrary.forEach((mg) => {
      mg.categories.forEach((cat) => {
        exercises.push(...cat.exercises);
      });
    });
    return exercises;
  }, []);

  const filteredExercises = useMemo(() => {
    let filtered = allExercises;

    if (selectedMuscleGroup) {
      filtered = filtered.filter(
        (ex) => ex.muscleGroup === exerciseLibrary.find((mg) => mg.id === selectedMuscleGroup)?.name
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((ex) => {
        const category = exerciseLibrary
          .flatMap((mg) => mg.categories)
          .find((c) => c.id === selectedCategory);
        return ex.category === category?.name;
      });
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [allExercises, selectedMuscleGroup, selectedCategory, searchQuery]);

  const handleExerciseSelect = (exercise: LibraryExercise) => {
    if (onSelectCallback) {
      router.back();
      const callback = (global as Record<string, unknown>)[onSelectCallback];
      if (callback && typeof callback === "function") {
        callback(exercise.name, exercise.muscleGroup);
      }
    }
  };

  const clearFilters = () => {
    setSelectedMuscleGroup("");
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
          <ArrowLeft size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
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
          data={muscleGroups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.filterChip,
                selectedMuscleGroup === item.id && styles.filterChipActive,
                pressed && styles.filterChipPressed,
              ]}
              onPress={() => {
                setSelectedMuscleGroup(
                  selectedMuscleGroup === item.id ? "" : item.id
                );
                setSelectedCategory("");
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedMuscleGroup === item.id &&
                    styles.filterChipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {selectedMuscleGroup && categories.length > 0 && (
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

      {(selectedMuscleGroup || selectedCategory || searchQuery) && (
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
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.exercisesList}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.exerciseCard,
              pressed && styles.exerciseCardPressed,
            ]}
            onPress={() => handleExerciseSelect(item)}
          >
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseDetails}>
                {item.muscleGroup} {"•"} {item.category} {"•"} {item.equipment}
              </Text>
            </View>
            {onSelectCallback && (
              <Plus size={20} color={Colors.primaryAccent} />
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No exercises found</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    borderRadius: 10,
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  searchSection: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filtersSection: {
    backgroundColor: Colors.background,
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
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  filterChipActive: {
    backgroundColor: Colors.primaryAccent,
    borderColor: Colors.primaryAccent,
  },
  filterChipPressed: {
    opacity: 0.7,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E0E0E0",
  },
  filterChipTextActive: {
    color: "#000000",
  },
  categoriesSection: {
    backgroundColor: Colors.background,
    paddingBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryAccent,
    borderColor: Colors.primaryAccent,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E0E0E0",
  },
  categoryChipTextActive: {
    color: "#000000",
  },
  clearFiltersSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  clearFiltersButton: {
    padding: 8,
    alignSelf: "flex-start",
  },
  clearFiltersButtonPressed: {
    opacity: 0.7,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryAccent,
  },
  exercisesList: {
    padding: 16,
    gap: 10,
  },
  exerciseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  exerciseCardPressed: {
    opacity: 0.7,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  exerciseDetails: {
    fontSize: 13,
    color: "#B0B0B0",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: "#B0B0B0",
    fontWeight: "500",
  },
});
