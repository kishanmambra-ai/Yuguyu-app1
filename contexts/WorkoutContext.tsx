import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useState, useRef } from "react";

import {
  ActiveWorkout,
  ActiveCardioActivity,
  CardioActivity,
  ActivityType,
  Exercise,
  WorkoutHistory,
  WorkoutRoutine,
} from "@/types/workout";

const STORAGE_KEY = "yuguyu_workouts";
const HISTORY_KEY = "yuguyu_workout_history";
const CARDIO_HISTORY_KEY = "yuguyu_cardio_history";

export const [WorkoutProvider, useWorkouts] = createContextHook(() => {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(
    null,
  );
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [cardioHistory, setCardioHistory] = useState<CardioActivity[]>([]);
  const [activeCardio, setActiveCardio] = useState<ActiveCardioActivity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [routinesData, historyData, cardioData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
        AsyncStorage.getItem(CARDIO_HISTORY_KEY),
      ]);

      if (routinesData && routinesData !== 'undefined' && routinesData !== 'null' && (routinesData.trim().startsWith('[') || routinesData.trim().startsWith('{'))) {
        try {
          const parsed = JSON.parse(routinesData);
          setRoutines(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Failed to parse routines, clearing data:", e);
          await AsyncStorage.removeItem(STORAGE_KEY);
          setRoutines([]);
        }
      }
      if (historyData && historyData !== 'undefined' && historyData !== 'null' && (historyData.trim().startsWith('[') || historyData.trim().startsWith('{'))) {
        try {
          const parsed = JSON.parse(historyData);
          setHistory(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Failed to parse history, clearing data:", e);
          await AsyncStorage.removeItem(HISTORY_KEY);
          setHistory([]);
        }
      }
      if (cardioData && cardioData !== 'undefined' && cardioData !== 'null' && (cardioData.trim().startsWith('[') || cardioData.trim().startsWith('{'))) {
        try {
          const parsed = JSON.parse(cardioData);
          setCardioHistory(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Failed to parse cardio history, clearing data:", e);
          await AsyncStorage.removeItem(CARDIO_HISTORY_KEY);
          setCardioHistory([]);
        }
      }
    } catch (error) {
      console.error("Failed to load workout data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRoutines = async (updatedRoutines: WorkoutRoutine[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoutines));
      setRoutines(updatedRoutines);
    } catch (error) {
      console.error("Failed to save routines:", error);
    }
  };

  const saveHistory = async (updatedHistory: WorkoutHistory[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  };

  const addRoutine = useCallback(
    (name: string, exercises: Exercise[]) => {
      const newRoutine: WorkoutRoutine = {
        id: Date.now().toString(),
        name,
        exercises,
        createdAt: new Date().toISOString(),
      };
      saveRoutines([...routines, newRoutine]);
    },
    [routines],
  );

  const updateRoutine = useCallback(
    (id: string, name: string, exercises: Exercise[]) => {
      const updated = routines.map((r) =>
        r.id === id ? { ...r, name, exercises } : r,
      );
      saveRoutines(updated);
    },
    [routines],
  );

  const deleteRoutine = useCallback(
    (id: string) => {
      const updated = routines.filter((r) => r.id !== id);
      saveRoutines(updated);
    },
    [routines],
  );

  const startWorkout = useCallback(
    (routineId: string) => {
      const routine = routines.find((r) => r.id === routineId);
      if (!routine) return;

      const workoutExercises: Exercise[] = routine.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((set) => ({ ...set, completed: false })),
      }));

      setActiveWorkout({
        routineId,
        routine: { ...routine, exercises: workoutExercises },
        startedAt: new Date().toISOString(),
        currentExerciseIndex: 0,
      });
    },
    [routines],
  );

  const updateSetCompletion = useCallback(
    (exerciseId: string, setId: string, reps?: number, time?: number, weight?: number) => {
      if (!activeWorkout) return;

      const updatedExercises = activeWorkout.routine.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((set) =>
              set.id === setId
                ? { ...set, reps, time, weight, completed: true }
                : set,
            ),
          };
        }
        return ex;
      });

      setActiveWorkout({
        ...activeWorkout,
        routine: {
          ...activeWorkout.routine,
          exercises: updatedExercises,
        },
      });
    },
    [activeWorkout],
  );

  const completeWorkout = useCallback(() => {
    if (!activeWorkout) return;

    const totalSets = activeWorkout.routine.exercises.reduce(
      (sum, ex) => sum + ex.sets.length,
      0,
    );
    const totalReps = activeWorkout.routine.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.reps || 0), 0),
      0,
    );

    const historyEntry: WorkoutHistory = {
      id: Date.now().toString(),
      routineId: activeWorkout.routineId,
      routineName: activeWorkout.routine.name,
      exercises: activeWorkout.routine.exercises,
      startedAt: activeWorkout.startedAt,
      completedAt: new Date().toISOString(),
      totalSets,
      totalReps,
    };

    saveHistory([historyEntry, ...history]);

    const updatedRoutines = routines.map((r) =>
      r.id === activeWorkout.routineId
        ? { ...r, lastPerformed: new Date().toISOString() }
        : r,
    );
    saveRoutines(updatedRoutines);

    setActiveWorkout(null);
  }, [activeWorkout, history, routines]);

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  const markAllSetsComplete = useCallback(() => {
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.routine.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((set) => ({
        ...set,
        completed: true,
      })),
    }));

    setActiveWorkout({
      ...activeWorkout,
      routine: {
        ...activeWorkout.routine,
        exercises: updatedExercises,
      },
    });
  }, [activeWorkout]);

  const saveCardioHistory = async (updatedHistory: CardioActivity[]) => {
    try {
      await AsyncStorage.setItem(CARDIO_HISTORY_KEY, JSON.stringify(updatedHistory));
      setCardioHistory(updatedHistory);
    } catch (error) {
      console.error("Failed to save cardio history:", error);
    }
  };

  const lastLocationRef = useRef<any>(null);

  const startCardioActivity = useCallback((type: ActivityType, initialSteps?: number) => {
    lastLocationRef.current = null;
    setActiveCardio({
      type,
      startedAt: new Date().toISOString(),
      totalPausedDuration: 0,
      distance: 0,
      route: [],
      isTracking: true,
      steps: 0,
      initialSteps: initialSteps,
      currentSpeed: 0,
    });
  }, []);

  const pauseCardioActivity = useCallback(() => {
    if (!activeCardio || activeCardio.pausedAt) return;
    setActiveCardio({
      ...activeCardio,
      pausedAt: new Date().toISOString(),
      isTracking: false,
      currentSpeed: 0,
    });
  }, [activeCardio]);

  const resumeCardioActivity = useCallback(() => {
    if (!activeCardio || !activeCardio.pausedAt) return;
    const pauseDuration = Date.now() - new Date(activeCardio.pausedAt).getTime();
    // Reset last location on resume to avoid jumping from pause location
    lastLocationRef.current = null;
    setActiveCardio({
      ...activeCardio,
      pausedAt: undefined,
      totalPausedDuration: activeCardio.totalPausedDuration + pauseDuration,
      isTracking: true,
    });
  }, [activeCardio]);

  const completeCardioActivity = useCallback(() => {
    if (!activeCardio) return;

    const now = new Date().toISOString();
    const totalDuration = Date.now() - new Date(activeCardio.startedAt).getTime();
    const activeDuration = totalDuration - activeCardio.totalPausedDuration;

    const avgSpeed = activeCardio.distance > 0 && activeDuration > 0
      ? (activeCardio.distance / 1000) / (activeDuration / 3600000)
      : 0;

    const avgPace = avgSpeed > 0 ? 60 / avgSpeed : 0;

    const activity: CardioActivity = {
      id: Date.now().toString(),
      type: activeCardio.type,
      startedAt: activeCardio.startedAt,
      completedAt: now,
      duration: activeDuration,
      distance: activeCardio.distance,
      averageSpeed: avgSpeed,
      averagePace: avgPace,
      route: activeCardio.route,
      pausedDuration: activeCardio.totalPausedDuration,
      steps: activeCardio.steps,
    };

    saveCardioHistory([activity, ...cardioHistory]);
    setActiveCardio(null);
  }, [activeCardio, cardioHistory]);

  const cancelCardioActivity = useCallback(() => {
    setActiveCardio(null);
  }, []);

  const updateCardioSteps = useCallback((steps: number) => {
    if (!activeCardio) return;

    let updates: Partial<typeof activeCardio> = { steps };

    // For indoor activities, calculate distance based on steps since we don't use GPS
    if (activeCardio.type === 'indoor_run' || activeCardio.type === 'indoor_walk') {
      // Estimate stride length (can be refined with user height if available)
      const strideLength = activeCardio.type === 'indoor_run' ? 1.0 : 0.76;
      updates.distance = steps * strideLength;

      // Calculate derived average speed for indoor (total distance / total time)
      const duration = Date.now() - new Date(activeCardio.startedAt).getTime() - activeCardio.totalPausedDuration;
      if (duration > 0) {
        // m/s
        updates.currentSpeed = (updates.distance / (duration / 1000));
      }
    }

    setActiveCardio(prev => prev ? ({ ...prev, ...updates }) : null);
  }, [activeCardio]);

  const updateCardioLocation = useCallback((latitude: number, longitude: number, speed?: number, accuracy?: number) => {
    const MIN_DISTANCE = 1; // Lowered from 2m to 1m for better sensitivity
    const MAX_SPEED_KMH = 50;
    const MAX_ACCURACY = 30; // Increased tolerance for GPS accuracy

    if (accuracy && accuracy > MAX_ACCURACY) {
      console.log('GPS accuracy too low:', accuracy);
      return;
    }

    const newPoint = {
      latitude,
      longitude,
      timestamp: Date.now(),
      speed,
      accuracy,
    };

    // Use a reference to check the last processed point to avoid race conditions
    let lastPoint = lastLocationRef.current;

    // If this is the first point, just store it and return
    if (!lastPoint) {
      console.log('First GPS point recorded');
      lastLocationRef.current = newPoint;
      setActiveCardio((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          route: [...prev.route, newPoint],
          currentSpeed: speed !== undefined && speed >= 0 ? speed : 0,
        };
      });
      return;
    }

    const timeDiff = (newPoint.timestamp - lastPoint.timestamp) / 1000;

    // Minimum time between updates (0.5 seconds)
    if (timeDiff < 0.5) {
      return;
    }

    const additionalDistance = calculateDistance(
      lastPoint.latitude,
      lastPoint.longitude,
      latitude,
      longitude
    );

    console.log(`Distance from last point: ${additionalDistance.toFixed(2)}m`);

    if (additionalDistance < MIN_DISTANCE) {
      // Don't update ref if we didn't move enough
      // But update speed to 0 so the UI reflects we are stopped
      setActiveCardio((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentSpeed: (speed !== undefined && speed >= 0) ? speed : 0
        };
      });
      return;
    }

    const speedKmh = (additionalDistance / 1000) / (timeDiff / 3600);
    if (speedKmh > MAX_SPEED_KMH) {
      console.log('Unrealistic speed, ignoring:', speedKmh);
      return;
    }

    // Update the ref to the new valid point
    lastLocationRef.current = newPoint;

    console.log(`Adding distance: ${additionalDistance.toFixed(2)}m`);

    // Use functional update to ensure we don't use stale state
    setActiveCardio((prev) => {
      if (!prev || !prev.isTracking) return prev;
      const newDistance = prev.distance + additionalDistance;
      console.log(`Total distance now: ${newDistance.toFixed(2)}m`);

      // Use GPS speed if available and valid (>0), otherwise fallback to calculated speed
      const derivedSpeed = speed !== undefined && speed >= 0 ? speed : (additionalDistance / timeDiff);

      return {
        ...prev,
        distance: newDistance,
        route: [...prev.route, newPoint],
        currentSpeed: derivedSpeed,
      };
    });
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  return {
    routines,
    activeWorkout,
    history,
    cardioHistory,
    activeCardio,
    isLoading,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    startWorkout,
    updateSetCompletion,
    completeWorkout,
    cancelWorkout,
    markAllSetsComplete,
    startCardioActivity,
    pauseCardioActivity,
    resumeCardioActivity,
    completeCardioActivity,
    cancelCardioActivity,
    updateCardioLocation,
    updateCardioSteps,
  };
});
