import { router } from "expo-router";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";
import { Check, Pause, Play, X, MapPin } from "lucide-react-native";
import { useEffect, useState, useRef } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";

import { useWorkouts } from "@/contexts/WorkoutContext";

let MapView: any = null;
let Polyline: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

try {
  const maps = require("react-native-maps");
  MapView = maps.default;
  Polyline = maps.Polyline;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
} catch (e) {
  console.log("react-native-maps not available");
}

export default function RecordActivityNative() {
  const {
    activeCardio,
    pauseCardioActivity,
    resumeCardioActivity,
    completeCardioActivity,
    cancelCardioActivity,
    updateCardioLocation,
    updateCardioSteps,
  } = useWorkouts();

  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pedometerAvailable, setPedometerAvailable] = useState<boolean>(false);
  const [mapError, setMapError] = useState<boolean>(false);
  const mapRef = useRef<any>(null);
  const isTrackingRef = useRef<boolean>(true);
  const updateLocationRef = useRef(updateCardioLocation);
  const updateStepsRef = useRef(updateCardioSteps);

  useEffect(() => {
    updateLocationRef.current = updateCardioLocation;
    updateStepsRef.current = updateCardioSteps;
  }, [updateCardioLocation, updateCardioSteps]);

  useEffect(() => {
    if (activeCardio) {
      isTrackingRef.current = activeCardio.isTracking;
    }
  }, [activeCardio]);

  useEffect(() => {
    Pedometer.isAvailableAsync().then(setPedometerAvailable).catch(() => setPedometerAvailable(false));
  }, []);

  useEffect(() => {
    if (!activeCardio) {
      router.replace("/(tabs)/workouts" as any);
      return;
    }

    let pedometerSubscription: any = null;
    let locationSubscription: Location.LocationSubscription | null = null;

    const setupPedometer = async () => {
      if (!pedometerAvailable) return;

      try {
        // Track steps from slightly before activity start time to ensure we catch everything
        const activityStartTime = new Date(new Date(activeCardio.startedAt).getTime() - 1000);

        // Polling function is reliable on both iOS and Android for range queries
        const pollSteps = async () => {
          try {
            const now = new Date();
            const result = await Pedometer.getStepCountAsync(activityStartTime, now);
            if (result && typeof result.steps === 'number') {
              // Add any initial steps if we're resuming
              const startOffset = activeCardio.initialSteps || 0;
              updateStepsRef.current(startOffset + result.steps);
            }
          } catch (e) {
            console.log("Error polling pedometer:", e);
          }
        };

        // Poll frequently (every 2.5 seconds)
        const pollInterval = setInterval(pollSteps, 2500);
        pollSteps(); // Initial poll

        // Also setup watchStepCount as a backup/realtime trigger
        // but prioritize the polled total if available
        pedometerSubscription = Pedometer.watchStepCount((result) => {
          // We prefer the polled count, but this event listener 
          // keeps the sophisticated sensor active in the background
          if (Platform.OS === 'android') {
            // On Android, this returns total steps since boot usually, so we need offset logic
            // But for now we'll rely on the polling for the "session" count
          }
        });

        // Store cleanup for poll interval attached to the subscription object
        // so it gets cleaned up in the useEffect return
        if (pedometerSubscription) {
          const originalRemove = pedometerSubscription.remove;
          pedometerSubscription.remove = () => {
            clearInterval(pollInterval);
            originalRemove && originalRemove.call(pedometerSubscription);
          };
        } else {
          // If watch failed but we still want to poll (e.g. Android permission quirks)
          pedometerSubscription = {
            remove: () => clearInterval(pollInterval)
          } as any;
        }

      } catch (error) {
        console.error("Pedometer error:", error);
      }
    };

    const setupLocationTracking = async () => {
      // specialized indoor modes don't use GPS
      if (activeCardio.type === 'indoor_run' || activeCardio.type === 'indoor_walk') return;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Location permission denied");
          return;
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 3,
          },
          (location) => {
            if (isTrackingRef.current) {
              updateLocationRef.current(
                location.coords.latitude,
                location.coords.longitude,
                location.coords.speed || undefined,
                location.coords.accuracy ?? undefined
              );
            }
          }
        );
      } catch (error) {
        console.error("Location tracking error:", error);
        setLocationError("Failed to start location tracking");
      }
    };

    setupPedometer();
    setupLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (pedometerSubscription) {
        pedometerSubscription.remove();
      }
    };
  }, [activeCardio, pedometerAvailable]);

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
    // Dependencies optimized to prevent interval clearing on every location update
  }, [activeCardio?.isTracking, activeCardio?.startedAt, activeCardio?.totalPausedDuration]);

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

  // Use real-time currentSpeed if available (GPS/Indoor estimation), converted to km/h
  // Fallback to average speed if currentSpeed is missing
  const currentSpeed = activeCardio.currentSpeed !== undefined
    ? activeCardio.currentSpeed * 3.6
    : (activeCardio.distance > 0 && elapsedTime > 0
      ? ((activeCardio.distance / 1000) / (elapsedTime / 3600000))
      : 0);

  const getStepCount = (): number => {
    if (pedometerAvailable && activeCardio.steps !== undefined) {
      return activeCardio.steps;
    }

    const distance = activeCardio.distance;
    const activityType = activeCardio.type;
    const speedKmh = currentSpeed;
    let strideLength: number;

    if (activityType === "walking") {
      // More granular walking stride based on height averages and speed
      if (speedKmh < 2) strideLength = 0.6;      // Very slow walk
      else if (speedKmh < 3) strideLength = 0.65; // Slow walk
      else if (speedKmh < 4) strideLength = 0.7;  // Moderate walk
      else if (speedKmh < 5) strideLength = 0.75; // Brisk walk
      else if (speedKmh < 6) strideLength = 0.8;  // Fast walk
      else strideLength = 0.85;                   // Very fast walk/Power walk
    } else if (activityType === "running") {
      // Running stride increases significantly with speed
      if (speedKmh < 8) strideLength = 0.9;       // Jogging
      else if (speedKmh < 10) strideLength = 1.0; // Moderate run
      else if (speedKmh < 12) strideLength = 1.15; // Fast run
      else if (speedKmh < 15) strideLength = 1.3; // Very fast run
      else strideLength = 1.5;                    // Sprinting
    } else if (activityType === "hiking") {
      strideLength = 0.65; // Hiking usually involves shorter steps due to terrain
    } else {
      strideLength = 0.75;
    }

    return Math.floor(distance / strideLength);
  };

  const showSteps = activeCardio.type === "walking" ||
    activeCardio.type === "running" ||
    activeCardio.type === "hiking";

  const handlePause = () => {
    if (activeCardio.isTracking) {
      pauseCardioActivity();
    } else {
      resumeCardioActivity();
    }
  };

  const handleComplete = () => {
    Alert.alert(
      "Complete Activity",
      `Distance: ${formatDistance(activeCardio.distance)}\nTime: ${formatTime(elapsedTime)}`,
      [
        { text: "Keep Going", style: "cancel" },
        {
          text: "Complete",
          onPress: () => {
            completeCardioActivity();
            router.replace("/(tabs)/workouts" as any);
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Activity",
      "Are you sure you want to cancel? Your activity will not be saved.",
      [
        { text: "Keep Going", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: () => {
            cancelCardioActivity();
            router.replace("/(tabs)/workouts" as any);
          },
        },
      ]
    );
  };

  const activityName = activeCardio.type.charAt(0).toUpperCase() + activeCardio.type.slice(1);

  const renderMap = () => {
    return (
      <View style={styles.mapPlaceholder}>
        {activeCardio.route.length === 0 ? (
          <>
            <Text style={styles.mapPlaceholderText}>Waiting for GPS...</Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Start moving to track your route
            </Text>
          </>
        ) : (
          <>
            <MapPin size={48} color="#34C759" />
            <Text style={styles.mapPlaceholderText}>
              Tracking {activeCardio.route.length} points
            </Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Distance: {formatDistance(activeCardio.distance)}
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{activityName}</Text>
      </View>

      {locationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.mainStats}>
          <View style={styles.primaryStat}>
            <Text style={styles.primaryLabel}>Distance</Text>
            <Text
              style={styles.primaryValue}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatDistance(activeCardio.distance)}
            </Text>
          </View>

          <View style={styles.primaryStat}>
            <Text style={styles.primaryLabel}>Time</Text>
            <Text
              style={styles.primaryValue}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatTime(elapsedTime)}
            </Text>
          </View>
        </View>

        <View style={styles.secondaryStats}>
          {showSteps ? (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Steps</Text>
                <Text style={styles.statValue}>
                  {getStepCount().toLocaleString()}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Speed</Text>
                <Text style={styles.statValue}>
                  {currentSpeed.toFixed(1)}
                  <Text style={styles.statUnit}> km/h</Text>
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Speed</Text>
              <Text style={styles.statValue}>
                {currentSpeed.toFixed(1)}
                <Text style={styles.statUnit}> km/h</Text>
              </Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }} />
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  errorBanner: {
    backgroundColor: Colors.warning,
    padding: 12,
    alignItems: "center",
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  mainStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  primaryStat: {
    alignItems: "center",
    flex: 1, // Ensure equal width allocation
  },
  primaryLabel: {
    fontSize: 14, // Slightly smaller label
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  primaryValue: {
    fontSize: 42, // Reduced from 56
    fontWeight: "700",
    color: Colors.primaryAccent,
    textAlign: "center", // Ensure text stays centered
  },

  secondaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 6,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
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
