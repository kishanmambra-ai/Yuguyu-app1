import { router } from "expo-router";
import { Check, Pause, Play, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useWorkouts } from "@/contexts/WorkoutContext";

export default function RecordActivityWeb() {
  const {
    activeCardio,
    pauseCardioActivity,
    resumeCardioActivity,
    completeCardioActivity,
    cancelCardioActivity,
  } = useWorkouts();

  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    if (!activeCardio) {
      router.replace("/(tabs)/workouts" as any);
      return;
    }
  }, [activeCardio]);

  useEffect(() => {
    if (!activeCardio) return;

    if (!activeCardio.isTracking) {
      const totalTime = Date.now() - new Date(activeCardio.startedAt).getTime();
      const pausedTime = activeCardio.pausedAt
        ? activeCardio.totalPausedDuration +
          (Date.now() - new Date(activeCardio.pausedAt).getTime())
        : activeCardio.totalPausedDuration;
      setElapsedTime(totalTime - pausedTime);
      return;
    }

    const interval = setInterval(() => {
      const totalTime = Date.now() - new Date(activeCardio.startedAt).getTime();
      const pausedTime = activeCardio.totalPausedDuration;
      setElapsedTime(totalTime - pausedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCardio, activeCardio?.isTracking]);

  if (!activeCardio) {
    return null;
  }

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const currentSpeed = activeCardio.distance > 0 && elapsedTime > 0
    ? ((activeCardio.distance / 1000) / (elapsedTime / 3600000))
    : 0;

  const handlePause = () => {
    if (activeCardio.isTracking) {
      pauseCardioActivity();
    } else {
      resumeCardioActivity();
    }
  };

  const handleComplete = () => {
    if (confirm(`Complete activity?\nDistance: ${formatDistance(activeCardio.distance)}\nTime: ${formatTime(elapsedTime)}`)) {
      completeCardioActivity();
      router.replace("/(tabs)/workouts" as any);
    }
  };

  const handleCancel = () => {
    if (confirm("Cancel activity? Your progress will not be saved.")) {
      cancelCardioActivity();
      router.replace("/(tabs)/workouts" as any);
    }
  };

  const activityName = activeCardio.type.charAt(0).toUpperCase() + activeCardio.type.slice(1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{activityName}</Text>
      </View>

      <View style={styles.errorBanner}>
        <Text style={styles.errorText}>Web mode - GPS tracking not available</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.mainStats}>
          <View style={styles.primaryStat}>
            <Text style={styles.primaryLabel}>Distance</Text>
            <Text style={styles.primaryValue}>
              {formatDistance(activeCardio.distance)}
            </Text>
          </View>

          <View style={styles.primaryStat}>
            <Text style={styles.primaryLabel}>Time</Text>
            <Text style={styles.primaryValue}>{formatTime(elapsedTime)}</Text>
          </View>
        </View>

        <View style={styles.secondaryStats}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Speed</Text>
            <Text style={styles.statValue}>
              {currentSpeed.toFixed(1)}
              <Text style={styles.statUnit}> km/h</Text>
            </Text>
          </View>
        </View>

        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Map not available on web</Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Use the mobile app for GPS tracking
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              styles.cancelButton,
              pressed && styles.controlButtonPressed,
            ]}
            onPress={handleCancel}
          >
            <X size={24} color="#FFFFFF" />
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.controlButton,
              activeCardio.isTracking
                ? styles.pauseButton
                : styles.resumeButton,
              pressed && styles.controlButtonPressed,
            ]}
            onPress={handlePause}
          >
            {activeCardio.isTracking ? (
              <>
                <Pause size={32} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.controlButtonText}>Pause</Text>
              </>
            ) : (
              <>
                <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.controlButtonText}>Resume</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              styles.completeButton,
              pressed && styles.controlButtonPressed,
            ]}
            onPress={handleComplete}
          >
            <Check size={24} color="#FFFFFF" />
            <Text style={styles.secondaryButtonText}>Complete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1A1A1A",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  errorBanner: {
    backgroundColor: "#FF9500",
    padding: 12,
    alignItems: "center",
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  mainStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 32,
    marginBottom: 40,
  },
  primaryStat: {
    alignItems: "center",
  },
  primaryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  primaryValue: {
    fontSize: 56,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryStats: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    maxWidth: 200,
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statUnit: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: "#666666",
  },
  controls: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 60,
    gap: 12,
  },
  secondaryButton: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    minWidth: 80,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  completeButton: {
    backgroundColor: "#34C759",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pauseButton: {
    backgroundColor: "#FF9500",
  },
  resumeButton: {
    backgroundColor: "#34C759",
  },
  controlButtonPressed: {
    opacity: 0.8,
  },
  controlButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
