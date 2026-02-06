import { router } from "expo-router";
import { Check, X, CheckCheck, Award, TrendingUp, XCircle } from "lucide-react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import * as Haptics from "expo-haptics";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import KeyboardAvoidingWrapper from "@/components/KeyboardAvoidingWrapper";
import { useWorkouts } from "@/contexts/WorkoutContext";
import { calculatePersonalBests } from "@/utils/workout-stats";

export default function ActiveWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { activeWorkout, updateSetCompletion, markAllSetsComplete, history, completeWorkout, cancelWorkout } =
    useWorkouts();

  const [editingSet, setEditingSet] = useState<{
    exerciseId: string;
    setId: string;
    reps?: string;
    time?: string;
    weight: string;
    isTimeBased: boolean;
  } | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [newPR, setNewPR] = useState<{
    exerciseName: string;
    weight: number;
    reps: number;
  } | null>(null);
  const [prAnimation] = useState(new Animated.Value(0));

  const personalBests = useMemo(() => {
    return calculatePersonalBests(history);
  }, [history]);

  const getExercisePR = useCallback((exerciseName: string) => {
    return personalBests.find(pb => pb.exerciseName === exerciseName);
  }, [personalBests]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeWorkout) {
      router.replace("/(tabs)/workouts" as any);
    }
  }, [activeWorkout]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleSetPress = useCallback((
    exerciseId: string,
    setId: string,
    currentReps?: number,
    currentTime?: number,
    currentWeight?: number,
  ) => {
    setEditingSet({
      exerciseId,
      setId,
      reps: currentReps?.toString() || "",
      time: currentTime?.toString() || "",
      weight: currentWeight?.toString() || "",
      isTimeBased: currentTime !== undefined,
    });
  }, []);

  const handleSaveSet = useCallback(() => {
    if (!editingSet) return;

    const reps = editingSet.reps ? parseInt(editingSet.reps) : undefined;
    const time = editingSet.time ? parseInt(editingSet.time) : undefined;
    const weight = editingSet.weight ? parseFloat(editingSet.weight) : undefined;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    updateSetCompletion(editingSet.exerciseId, editingSet.setId, reps, time, weight);

    if (weight && reps && activeWorkout) {
      const exercise = activeWorkout.routine.exercises.find(ex => ex.id === editingSet.exerciseId);
      if (exercise) {
        const currentVolume = weight * reps;
        const pr = getExercisePR(exercise.name);
        
        if (!pr || currentVolume > pr.volume || 
            (currentVolume === pr.volume && weight > pr.weight)) {
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          setNewPR({ exerciseName: exercise.name, weight, reps });
          Animated.sequence([
            Animated.spring(prAnimation, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 7,
            }),
            Animated.delay(2500),
            Animated.timing(prAnimation, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => setNewPR(null));
        }
      }
    }

    setEditingSet(null);
  }, [editingSet, updateSetCompletion, activeWorkout, getExercisePR, prAnimation]);

  const handleCancelEdit = useCallback(() => {
    setEditingSet(null);
  }, []);



  const handleMarkAllComplete = useCallback(() => {
    Alert.alert(
      "Mark All Complete",
      "This will mark all sets as complete with their default values. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark All",
          onPress: () => {
            markAllSetsComplete();
          },
        },
      ],
    );
  }, [markAllSetsComplete]);

  const handleCompleteWorkout = useCallback(() => {
    Alert.alert(
      "Complete Workout",
      "Save this workout to your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: () => {
            completeWorkout();
            router.replace("/(tabs)/workouts" as any);
          },
        },
      ],
    );
  }, [completeWorkout]);

  const handleCancelWorkout = useCallback(() => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure? Your progress will not be saved.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            cancelWorkout();
            router.replace("/(tabs)/workouts" as any);
          },
        },
      ],
    );
  }, [cancelWorkout]);

  if (!activeWorkout) {
    return null;
  }

  const totalSets = activeWorkout.routine.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0,
  );
  const completedSets = activeWorkout.routine.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0,
  );

  return (
    <View style={styles.container}>
      <View style={[styles.safeAreaTop, { height: insets.top }]} />
      {newPR && (
        <Animated.View
          style={[
            styles.prNotification,
            {
              top: insets.top + 24,
              opacity: prAnimation,
              transform: [
                {
                  translateY: prAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Award size={20} color="#FFD700" />
          <View style={styles.prNotificationContent}>
            <Text style={styles.prNotificationTitle}>New Personal Record!</Text>
            <Text style={styles.prNotificationText}>
              {newPR.exerciseName}: {newPR.weight} kg × {newPR.reps} reps
            </Text>
          </View>
        </Animated.View>
      )}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{activeWorkout.routine.name}</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={styles.progressHeader}>
          <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.markAllButton,
              pressed && styles.markAllButtonPressed,
            ]}
            onPress={handleMarkAllComplete}
          >
            <CheckCheck size={16} color={Colors.primaryAccent} />
            <Text style={styles.markAllButtonText}>Mark All</Text>
          </Pressable>
        </View>
        <Text style={styles.progressText}>
          {completedSets} / {totalSets} sets completed
        </Text>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(completedSets / totalSets) * 100}%` },
            ]}
          />
        </View>
      </View>

      <KeyboardAvoidingWrapper style={styles.content}>
        {activeWorkout.routine.exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseSection}>
            <Text style={styles.exerciseName}>
              {exerciseIndex + 1}. {exercise.name}
            </Text>
            {exercise.notes && (
              <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
            )}
            {!exercise.notes && getExercisePR(exercise.name) && (
              <View style={styles.prInfoContainer}>
                <TrendingUp size={14} color={Colors.primaryAccent} />
                <Text style={styles.prInfoText}>
                  PR: {getExercisePR(exercise.name)?.weight} kg × {getExercisePR(exercise.name)?.reps} reps
                </Text>
              </View>
            )}

            <View style={styles.setsContainer}>
              {exercise.sets.map((set, setIndex) => {
                const isEditing =
                  editingSet?.exerciseId === exercise.id &&
                  editingSet?.setId === set.id;

                const exercisePR = getExercisePR(exercise.name);
                const isCurrentPR = exercisePR && set.completed && set.weight && set.reps &&
                  (set.weight * set.reps > exercisePR.volume || 
                   (set.weight * set.reps === exercisePR.volume && set.weight > exercisePR.weight));

                return (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={styles.setNumber}>Set {setIndex + 1}</Text>

                    {isEditing ? (
                      <View style={styles.editSetForm}>
                        <View style={styles.editInputGroup}>
                          <Text style={styles.editLabel}>{editingSet.isTimeBased ? "Time (min)" : "Reps"}</Text>
                          <TextInput
                            style={styles.editInput}
                            value={editingSet.isTimeBased ? editingSet.time : editingSet.reps}
                            onChangeText={(text) =>
                              setEditingSet({ ...editingSet, [editingSet.isTimeBased ? "time" : "reps"]: text })
                            }
                            keyboardType="number-pad"
                            autoFocus
                          />
                        </View>
                        {!editingSet.isTimeBased && (
                          <View style={styles.editInputGroup}>
                            <Text style={styles.editLabel}>Weight (kg)</Text>
                            <TextInput
                              style={styles.editInput}
                              value={editingSet.weight}
                              onChangeText={(text) =>
                                setEditingSet({ ...editingSet, weight: text })
                              }
                              keyboardType="decimal-pad"
                              placeholder="Optional"
                              placeholderTextColor={Colors.textSecondary}
                            />
                          </View>
                        )}
                        <Pressable
                          style={({ pressed }) => [
                            styles.saveSetButton,
                            pressed && styles.saveSetButtonPressed,
                          ]}
                          onPress={handleSaveSet}
                        >
                          <Check size={18} color={Colors.background} />
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [
                            styles.cancelSetButton,
                            pressed && styles.cancelSetButtonPressed,
                          ]}
                          onPress={handleCancelEdit}
                        >
                          <X size={18} color={Colors.text} />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        style={({ pressed }) => [
                          styles.setButton,
                          !!set.completed && styles.setButtonCompleted,
                          !!isCurrentPR && styles.setButtonPR,
                          pressed && styles.setButtonPressed,
                        ]}
                        onPress={() =>
                          handleSetPress(
                            exercise.id,
                            set.id,
                            set.reps,
                            set.time,
                            set.weight,
                          )
                        }
                      >
                        <View style={styles.setButtonContent}>
                          <Text
                            style={[
                              styles.setButtonText,
                              !!set.completed && styles.setButtonTextCompleted,
                              !!isCurrentPR && styles.setButtonTextPR,
                            ]}
                          >
                            {set.time ? `${set.time} min` : `${set.reps || 0} reps`}
                            {set.weight ? ` × ${set.weight} kg` : ""}
                          </Text>
                          {isCurrentPR && (
                            <View style={styles.prBadge}>
                              <Award size={12} color="#FFD700" />
                              <Text style={styles.prBadgeText}>PR</Text>
                            </View>
                          )}
                        </View>
                        {set.completed && !isCurrentPR && (
                          <Check size={16} color={Colors.primaryAccent} />
                        )}
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        <View style={styles.bottomSpacer} />
      </KeyboardAvoidingWrapper>

      <View style={styles.bottomButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.cancelButtonPressed,
          ]}
          onPress={handleCancelWorkout}
        >
          <XCircle size={20} color={Colors.text} />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.completeButton,
            pressed && styles.completeButtonPressed,
          ]}
          onPress={handleCompleteWorkout}
        >
          <Check size={20} color={Colors.background} />
          <Text style={styles.completeButtonText}>Complete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeAreaTop: {
    backgroundColor: Colors.background,
    width: '100%',
  },
  header: {
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
  progressBar: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primaryAccent,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primaryAccent,
    backgroundColor: Colors.background,
  },
  markAllButtonPressed: {
    opacity: 0.6,
  },
  markAllButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryAccent,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.inputBackground,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primaryAccent,
  },
  content: {
    flex: 1,
  },
  exerciseSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  exerciseNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
    width: 50,
  },
  setButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  setButtonCompleted: {
    backgroundColor: Colors.inputBackground,
    borderColor: Colors.primaryAccent,
  },
  setButtonPressed: {
    opacity: 0.7,
  },
  setButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
  setButtonTextCompleted: {
    color: Colors.primaryAccent,
  },
  setButtonPR: {
    backgroundColor: "#FFD70015",
    borderColor: "#FFD700",
    borderWidth: 2,
  },
  setButtonTextPR: {
    color: "#FFD700",
    fontWeight: "700" as const,
  },
  setButtonContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFD70020",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  prBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFD700",
  },
  prInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  prInfoText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primaryAccent,
  },
  prNotification: {
    position: "absolute" as const,
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: "#1a1a1a",
    borderRadius: Platform.OS === 'android' ? 8 : 14,
    padding: Platform.OS === 'ios' ? 18 : 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 8 : 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.4 : 0.3,
    shadowRadius: Platform.OS === 'ios' ? 16 : 12,
    elevation: Platform.OS === 'android' ? 12 : 0,
    borderWidth: Platform.OS === 'ios' ? 1.5 : 2,
    borderColor: "#FFD700",
  },
  prNotificationContent: {
    flex: 1,
  },
  prNotificationTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFD700",
    marginBottom: 2,
  },
  prNotificationText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#FFFFFF",
  },
  editSetForm: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editInputGroup: {
    flex: 1,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  editInput: {
    borderWidth: Platform.OS === 'ios' ? 1 : 1,
    borderColor: Colors.primaryAccent,
    padding: Platform.OS === 'android' ? 8 : 10,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.background,
    borderRadius: Platform.OS === 'android' ? 4 : 8,
    textAlignVertical: Platform.OS === 'android' ? 'center' : 'auto',
  },
  saveSetButton: {
    padding: 10,
    backgroundColor: Colors.primaryAccent,
    justifyContent: "center",
    alignItems: "center",
  },
  saveSetButtonPressed: {
    opacity: 0.8,
  },
  cancelSetButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelSetButtonPressed: {
    opacity: 0.6,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomButtons: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  cancelButtonPressed: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  completeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: Colors.primaryAccent,
    borderRadius: 12,
  },
  completeButtonPressed: {
    opacity: 0.8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.background,
  },
});
