import { router, useLocalSearchParams } from "expo-router";
import { BookOpen, Plus, Trash2, X } from "lucide-react-native";
import { useEffect, useState, useCallback } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import KeyboardAvoidingWrapper from "@/components/KeyboardAvoidingWrapper";
import { useWorkouts } from "@/contexts/WorkoutContext";
import { Exercise } from "@/types/workout";

export default function EditRoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, updateRoutine } = useWorkouts();

  const [routineName, setRoutineName] = useState<string>("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isAddingExercise, setIsAddingExercise] = useState<boolean>(false);
  const [newExerciseName, setNewExerciseName] = useState<string>("");
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState<string>("");
  const [newExerciseSets, setNewExerciseSets] = useState<string>("3");
  const [newExerciseReps, setNewExerciseReps] = useState<string>("10");
  const [newExerciseTime, setNewExerciseTime] = useState<string>("30");

  useEffect(() => {
    const routine = routines.find((r) => r.id === id);
    if (routine) {
      setRoutineName(routine.name);
      setExercises(routine.exercises);
    } else {
      router.back();
    }
  }, [id, routines]);

  const handleExerciseFromLibrary = useCallback((exerciseName: string, muscleGroup?: string) => {
    setNewExerciseName(exerciseName);
    setNewExerciseMuscleGroup(muscleGroup || "");
    setIsAddingExercise(true);
  }, []);

  const openExerciseLibrary = () => {
    const callbackId = `exerciseSelect_${Date.now()}`;
    (global as Record<string, unknown>)[callbackId] = handleExerciseFromLibrary;
    router.push({
      pathname: "/exercise-library" as any,
      params: { onSelect: callbackId },
    });
  };

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) {
      Alert.alert("Error", "Exercise name is required");
      return;
    }

    const sets = parseInt(newExerciseSets) || 3;
    const isYoga = newExerciseMuscleGroup === "YOGA";
    
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: newExerciseName.trim(),
      muscleGroup: newExerciseMuscleGroup || undefined,
      sets: Array.from({ length: sets }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        reps: isYoga ? undefined : (parseInt(newExerciseReps) || 10),
        time: isYoga ? (parseInt(newExerciseTime) || 30) : undefined,
        completed: false,
      })),
    };

    setExercises([...exercises, newExercise]);
    setNewExerciseName("");
    setNewExerciseMuscleGroup("");
    setNewExerciseSets("3");
    setNewExerciseReps("10");
    setNewExerciseTime("30");
    setIsAddingExercise(false);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const handleSaveRoutine = () => {
    if (!routineName.trim()) {
      Alert.alert("Error", "Routine name is required");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("Error", "Add at least one exercise");
      return;
    }

    if (!id) return;

    updateRoutine(id, routineName.trim(), exercises);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
          onPress={() => router.back()}
        >
          <X size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Routine</Text>
        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
          onPress={handleSaveRoutine}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingWrapper style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Routine Name</Text>
          <TextInput
            style={styles.input}
            value={routineName}
            onChangeText={setRoutineName}
            placeholder="e.g., Upper Body Day"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Exercises</Text>
            {!isAddingExercise && (
              <View style={styles.actionButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={openExerciseLibrary}
                >
                  <BookOpen size={18} color={Colors.secondaryAccent} />
                  <Text style={styles.libraryButtonText}>Library</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => setIsAddingExercise(true)}
                >
                  <Plus size={18} color={Colors.primaryAccent} />
                  <Text style={styles.addButtonText}>Custom</Text>
                </Pressable>
              </View>
            )}
          </View>

          {isAddingExercise && (
            <View style={styles.addExerciseForm}>
              <TextInput
                style={styles.input}
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                placeholder="Exercise name"
                placeholderTextColor={Colors.textSecondary}
              />
              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Sets</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={newExerciseSets}
                    onChangeText={setNewExerciseSets}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>{newExerciseMuscleGroup === "YOGA" ? "Time (min)" : "Reps"}</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={newExerciseMuscleGroup === "YOGA" ? newExerciseTime : newExerciseReps}
                    onChangeText={newExerciseMuscleGroup === "YOGA" ? setNewExerciseTime : setNewExerciseReps}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>
              <View style={styles.formActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.formActionButton,
                    pressed && styles.formActionButtonPressed,
                  ]}
                  onPress={() => {
                    setIsAddingExercise(false);
                    setNewExerciseName("");
                    setNewExerciseMuscleGroup("");
                    setNewExerciseSets("3");
                    setNewExerciseReps("10");
                    setNewExerciseTime("30");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.formActionButton,
                    styles.primaryActionButton,
                    pressed && styles.formActionButtonPressed,
                  ]}
                  onPress={handleAddExercise}
                >
                  <Text style={styles.primaryActionButtonText}>Add</Text>
                </Pressable>
              </View>
            </View>
          )}

          {exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets.length} sets × {exercise.sets[0]?.time ? `${exercise.sets[0].time} min` : `${exercise.sets[0]?.reps || 0} reps`}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.deleteButtonPressed,
                ]}
                onPress={() => handleDeleteExercise(exercise.id)}
              >
                <Trash2 size={18} color="#FF3B30" />
              </Pressable>
            </View>
          ))}
        </View>
      </KeyboardAvoidingWrapper>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primaryAccent,
    textAlign: "right",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  addButtonPressed: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryAccent,
  },
  libraryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondaryAccent,
  },
  addExerciseForm: {
    gap: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.inputBackground,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formField: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 6,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  formActionButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formActionButtonPressed: {
    opacity: 0.6,
  },
  primaryActionButton: {
    backgroundColor: Colors.primaryAccent,
    borderColor: Colors.primaryAccent,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.background,
  },
  exerciseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonPressed: {
    opacity: 0.6,
  },
});
