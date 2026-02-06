import { router } from "expo-router";
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

import { workoutTemplates, templateCategories, WorkoutTemplate } from "@/constants/workout-templates";
import { useWorkouts } from "@/contexts/WorkoutContext";

export default function WorkoutTemplatesScreen() {
  const { addRoutine } = useWorkouts();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const categories = useMemo(() => {
    return templateCategories.map((cat) => ({
      id: cat,
      name: cat,
    }));
  }, []);

  const filteredTemplates = useMemo(() => {
    let filtered = workoutTemplates;

    if (selectedCategory) {
      filtered = filtered.filter(
        (template) => template.category === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleAddTemplate = (template: WorkoutTemplate) => {
    const exercises = template.exercises.map((ex, index) => ({
      id: `${Date.now()}-${index}`,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: ex.sets.map((set, setIndex) => ({
        ...set,
        id: `${Date.now()}-${index}-${setIndex}`,
      })),
      notes: ex.notes,
    }));

    addRoutine(template.name, exercises);
    Alert.alert("Success", `${template.name} added to your routines`);
    router.back();
  };

  const clearFilters = () => {
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
        <Text style={styles.headerTitle}>Workout Templates</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="#888888" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search templates..."
            placeholderTextColor="#888888"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={20} color="#888888" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.filtersSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.filterChip,
                selectedCategory === item.id && styles.filterChipActive,
                pressed && styles.filterChipPressed,
              ]}
              onPress={() => {
                setSelectedCategory(
                  selectedCategory === item.id ? "" : item.id
                );
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === item.id &&
                    styles.filterChipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {(selectedCategory || searchQuery) && (
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
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.templatesList}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.templateCard,
              pressed && styles.templateCardPressed,
            ]}
            onPress={() => handleAddTemplate(item)}
          >
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{item.name}</Text>
              <Text style={styles.templateDetails}>
                {item.category}
              </Text>
              <Text style={styles.templateDescription}>{item.description}</Text>
              <Text style={styles.templateExercises}>
                {item.exercises.length} exercise{item.exercises.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <Plus size={20} color="#FFD700" />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No templates found</Text>
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
  templatesList: {
    padding: 16,
    gap: 12,
  },
  templateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  templateCardPressed: {
    backgroundColor: "#E8E8E8",
  },
  templateInfo: {
    flex: 1,
    marginRight: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 6,
  },
  templateDetails: {
    fontSize: 13,
    color: "#888888",
    marginBottom: 5,
    fontWeight: "500",
  },
  templateDescription: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 8,
    fontWeight: "500",
  },
  templateExercises: {
    fontSize: 12,
    color: "#FFD700",
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
