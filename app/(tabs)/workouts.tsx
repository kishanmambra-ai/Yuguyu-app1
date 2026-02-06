import { router } from "expo-router";
import { Pedometer } from "expo-sensors";
import { Plus, Play, Trash2, MapPin, Sparkles } from "lucide-react-native";
import React, { useState, useCallback, useMemo } from "react";
import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { useWorkouts } from "@/contexts/WorkoutContext";
import { ActivityType } from "@/types/workout";

const RoutineCard = React.memo<{
  item: any;
  onStart: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  isDeleting: boolean;
}>(({ item, onStart, onEdit, onDelete, isDeleting }) => (
  <View style={styles.routineCard}>
    <View style={styles.routineInfo}>
      <Text style={styles.routineName}>{item.name}</Text>
      <Text style={styles.routineDetails}>
        {item.exercises.length} exercise
        {item.exercises.length !== 1 ? "s" : ""}
      </Text>
      {item.lastPerformed && (
        <Text style={styles.lastPerformed}>
          Last: {new Date(item.lastPerformed).toLocaleDateString()}
        </Text>
      )}
    </View>

    <View style={styles.routineActions}>
      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={() => onStart(item.id)}
      >
        <Play
          size={20}
          color={Colors.primaryAccent}
          fill={Colors.primaryAccent}
        />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={() => onEdit(item.id)}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={() => onDelete(item.id, item.name)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="#FF3B30" />
        ) : (
          <Trash2 size={20} color="#FF3B30" />
        )}
      </Pressable>
    </View>
  </View>
));
RoutineCard.displayName = 'RoutineCard';

const ActivityOption = React.memo<{
  type: string;
  onPress: () => void;
}>(({ type, onPress }) => {
  const getLabel = (type: string) => {
    switch (type) {
      case 'indoor_run': return 'Indoor Run (Treadmill)';
      case 'indoor_walk': return 'Indoor Walk';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.activityOption,
        pressed && styles.activityOptionPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.activityOptionText}>
        {getLabel(type)}
      </Text>
    </Pressable>
  );
});
ActivityOption.displayName = 'ActivityOption';

export default function WorkoutsScreen() {
  const { routines, isLoading, deleteRoutine, startWorkout, startCardioActivity } = useWorkouts();
  const [showActivitySelector, setShowActivitySelector] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteRoutine = useCallback((id: string, name: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Delete Routine", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          setDeletingId(id);
          deleteRoutine(id);
          setTimeout(() => setDeletingId(null), 500);
        },
      },
    ]);
  }, [deleteRoutine]);

  const handleStartWorkout = useCallback((id: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    startWorkout(id);
    router.push("/active-workout" as any);
  }, [startWorkout]);

  const handleEditRoutine = useCallback((id: string) => {
    router.push(`/edit-routine?id=${id}` as any);
  }, []);

  const handleRecordActivity = useCallback(async (type: ActivityType) => {
    let initialSteps = 0;

    if (Platform.OS !== 'web') {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        if (isAvailable) {
          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          const result = await Pedometer.getStepCountAsync(start, end);
          initialSteps = result.steps;
          console.log('Initial step count:', initialSteps);
        }
      } catch (error) {
        console.error('Failed to get initial step count:', error);
      }
    }

    startCardioActivity(type, initialSteps);
    setShowActivitySelector(false);
    router.push("/record-activity" as any);
  }, [startCardioActivity]);

  const renderRoutineItem = useCallback(({ item }: { item: any }) => (
    <RoutineCard
      item={item}
      onStart={handleStartWorkout}
      onEdit={handleEditRoutine}
      onDelete={handleDeleteRoutine}
      isDeleting={deletingId === item.id}
    />
  ), [handleStartWorkout, handleEditRoutine, handleDeleteRoutine, deletingId]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  const activityTypes = useMemo(() => ['running', 'walking', 'cycling', 'hiking', 'indoor_run', 'indoor_walk'] as const, []);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primaryAccent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {routines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No workout routines yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first routine to get started
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.emptyButtonPressed,
            ]}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push("/workout-templates" as any);
            }}
          >
            <Sparkles size={20} color={Colors.background} />
            <Text style={styles.emptyButtonText}>Browse Templates</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={renderRoutineItem}
          removeClippedSubviews={true}
          maxToRenderPerBatch={Platform.OS === 'android' ? 5 : 10}
          updateCellsBatchingPeriod={Platform.OS === 'android' ? 100 : 50}
          initialNumToRender={Platform.OS === 'android' ? 8 : 10}
          windowSize={Platform.OS === 'android' ? 5 : 10}
          getItemLayout={(data, index) => ({
            length: 98,
            offset: 112 * index,
            index,
          })}
        />
      )}

      <Modal
        visible={showActivitySelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActivitySelector(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setShowActivitySelector(false)}
        >
          <View style={styles.activitySelector}>
            <Text style={styles.selectorTitle}>Record Activity</Text>
            {activityTypes.map((type) => (
              <ActivityOption
                key={type}
                type={type}
                onPress={() => handleRecordActivity(type)}
              />
            ))}
          </View>
        </Pressable>
      </Modal>

      <View style={styles.fabContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.fabTertiary,
            pressed && styles.fabPressed,
          ]}
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push("/workout-templates" as any);
          }}
        >
          <Sparkles size={22} color={Colors.background} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.fabSecondary,
            pressed && styles.fabPressed,
          ]}
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setShowActivitySelector(true);
          }}
        >
          <MapPin size={24} color={Colors.background} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            router.push("/create-routine" as any);
          }}
        >
          <Plus size={28} color={Colors.background} />
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primaryAccent,
    paddingHorizontal: 24,
    paddingVertical: Platform.OS === 'ios' ? 12 : 14,
    borderRadius: Platform.OS === 'ios' ? 10 : 12,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 2 : 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.1,
    shadowRadius: Platform.OS === 'ios' ? 4 : 4,
    elevation: 3,
  },
  emptyButtonPressed: {
    opacity: 0.8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  separator: {
    height: 14,
  },
  routineCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    padding: 18,
    borderRadius: Platform.OS === 'android' ? 12 : 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 1 : 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.04 : 0.06,
    shadowRadius: Platform.OS === 'ios' ? 2 : 6,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  routineDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: "500",
  },
  lastPerformed: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  routineActions: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 12,
  },
  actionButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    borderRadius: 10,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonPressed: {
    opacity: 0.6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryAccent,
  },
  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
    gap: 14,
  },
  fab: {
    width: Platform.OS === 'ios' ? 56 : 60,
    height: Platform.OS === 'ios' ? 56 : 60,
    backgroundColor: Colors.primaryAccent,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Platform.OS === 'ios' ? 28 : 30,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 4 : 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.15,
    shadowRadius: Platform.OS === 'ios' ? 8 : 8,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  fabSecondary: {
    width: Platform.OS === 'ios' ? 56 : 60,
    height: Platform.OS === 'ios' ? 56 : 60,
    backgroundColor: Colors.secondaryAccent,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Platform.OS === 'ios' ? 28 : 30,
    shadowColor: Colors.secondaryAccent,
    shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 4 : 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.15,
    shadowRadius: Platform.OS === 'ios' ? 8 : 8,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  fabTertiary: {
    width: Platform.OS === 'ios' ? 56 : 60,
    height: Platform.OS === 'ios' ? 56 : 60,
    backgroundColor: Colors.warning,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Platform.OS === 'ios' ? 28 : 30,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 4 : 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.15,
    shadowRadius: Platform.OS === 'ios' ? 8 : 8,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  fabPressed: {
    opacity: 0.85,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  activitySelector: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Platform.OS === 'android' ? 16 : 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: Platform.OS === 'android' ? 16 : 12,
  },
  selectorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  activityOption: {
    backgroundColor: Colors.inputBackground,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityOptionPressed: {
    backgroundColor: Colors.border,
  },
  activityOptionText: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
  },
});
