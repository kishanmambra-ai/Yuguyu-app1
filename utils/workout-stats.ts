import { WorkoutHistory, CardioActivity } from "@/types/workout";

export interface PersonalBest {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  volume: number;
}

export interface ExerciseTrend {
  date: string;
  exerciseName: string;
  totalVolume: number;
  maxWeight: number;
  totalReps: number;
}

export interface WorkoutDayData {
  date: string;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  duration: number;
  workoutCount: number;
}

export interface CardioTrendData {
  date: string;
  distance: number;
  duration: number;
  steps: number;
  averageSpeed: number;
  activityCount: number;
}

export function calculatePersonalBests(history: WorkoutHistory[]): PersonalBest[] {
  const bestsByExercise = new Map<string, PersonalBest>();

  history.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.completed && set.weight && set.weight > 0 && set.reps) {
          const volume = set.weight * set.reps;
          const existing = bestsByExercise.get(exercise.name);

          if (!existing || volume > existing.volume || 
              (volume === existing.volume && set.weight > existing.weight)) {
            bestsByExercise.set(exercise.name, {
              exerciseName: exercise.name,
              weight: set.weight,
              reps: set.reps,
              date: workout.completedAt,
              volume,
            });
          }
        }
      });
    });
  });

  return Array.from(bestsByExercise.values()).sort((a, b) => b.volume - a.volume);
}

export function calculateExerciseTrends(
  history: WorkoutHistory[],
  exerciseName?: string
): ExerciseTrend[] {
  const trendMap = new Map<string, ExerciseTrend>();

  history.forEach((workout) => {
    const date = new Date(workout.completedAt).toISOString().split("T")[0];

    workout.exercises.forEach((exercise) => {
      if (exerciseName && exercise.name !== exerciseName) return;

      const totalVolume = exercise.sets.reduce((sum, set) => {
        if (set.completed && set.weight && set.reps) {
          return sum + set.weight * set.reps;
        }
        return sum;
      }, 0);

      const maxWeight = Math.max(
        ...exercise.sets
          .filter((s) => s.completed && s.weight)
          .map((s) => s.weight || 0)
      );

      const totalReps = exercise.sets.reduce((sum, set) => {
        return set.completed ? sum + (set.reps || 0) : sum;
      }, 0);

      const key = `${date}-${exercise.name}`;
      const existing = trendMap.get(key);

      if (existing) {
        trendMap.set(key, {
          ...existing,
          totalVolume: existing.totalVolume + totalVolume,
          maxWeight: Math.max(existing.maxWeight, maxWeight),
          totalReps: existing.totalReps + totalReps,
        });
      } else {
        trendMap.set(key, {
          date,
          exerciseName: exercise.name,
          totalVolume,
          maxWeight,
          totalReps,
        });
      }
    });
  });

  return Array.from(trendMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function calculateWorkoutTrends(
  history: WorkoutHistory[],
  days: number
): WorkoutDayData[] {
  const dataMap = new Map<string, WorkoutDayData>();
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    dataMap.set(dateStr, {
      date: dateStr,
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
      duration: 0,
      workoutCount: 0,
    });
  }

  history.forEach((workout) => {
    const date = new Date(workout.completedAt).toISOString().split("T")[0];
    const existing = dataMap.get(date);

    if (existing) {
      const totalVolume = workout.exercises.reduce((sum, exercise) => {
        return (
          sum +
          exercise.sets.reduce((setSum, set) => {
            if (set.completed && set.weight && set.reps) {
              return setSum + set.weight * set.reps;
            }
            return setSum;
          }, 0)
        );
      }, 0);

      const duration =
        new Date(workout.completedAt).getTime() -
        new Date(workout.startedAt).getTime();

      dataMap.set(date, {
        ...existing,
        totalVolume: existing.totalVolume + totalVolume,
        totalSets: existing.totalSets + workout.totalSets,
        totalReps: existing.totalReps + workout.totalReps,
        duration: existing.duration + duration,
        workoutCount: existing.workoutCount + 1,
      });
    }
  });

  return Array.from(dataMap.values());
}

export function calculateCardioTrends(
  cardioHistory: CardioActivity[],
  days: number
): CardioTrendData[] {
  const dataMap = new Map<string, CardioTrendData>();
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    dataMap.set(dateStr, {
      date: dateStr,
      distance: 0,
      duration: 0,
      steps: 0,
      averageSpeed: 0,
      activityCount: 0,
    });
  }

  cardioHistory.forEach((activity) => {
    if (!activity.completedAt) return;
    const date = new Date(activity.completedAt).toISOString().split("T")[0];
    const existing = dataMap.get(date);

    if (existing) {
      const newActivityCount = existing.activityCount + 1;
      const totalSpeed = existing.averageSpeed * existing.activityCount + (activity.averageSpeed || 0);
      
      dataMap.set(date, {
        ...existing,
        distance: existing.distance + activity.distance,
        duration: existing.duration + activity.duration,
        steps: existing.steps + (activity.steps || 0),
        averageSpeed: totalSpeed / newActivityCount,
        activityCount: newActivityCount,
      });
    }
  });

  return Array.from(dataMap.values());
}

export function getTopExercises(history: WorkoutHistory[], limit = 5): { name: string; count: number }[] {
  const exerciseCount = new Map<string, number>();

  history.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exerciseCount.set(exercise.name, (exerciseCount.get(exercise.name) || 0) + 1);
    });
  });

  return Array.from(exerciseCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface MuscleGroupStats {
  muscleGroup: string;
  totalSets: number;
  totalVolume: number;
  exerciseCount: number;
  lastWorked?: string;
  frequency: number;
}

export interface StrengthProgress {
  exerciseName: string;
  currentMax: number;
  previousMax: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

const MUSCLE_GROUP_MAP: Record<string, string> = {
  'CHEST': 'Chest',
  'BACK': 'Back',
  'SHOULDERS': 'Shoulders',
  'ARMS': 'Arms',
  'LEGS': 'Legs',
  'CORE': 'Core',
  'GLUTES': 'Glutes',
  'CALVES': 'Calves',
};

export function inferMuscleGroup(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  
  if (name.includes('bench') || name.includes('chest') || name.includes('fly') || name.includes('push-up') || name.includes('pushup') || name.includes('pec')) {
    return 'Chest';
  }
  if (name.includes('row') || name.includes('pull-up') || name.includes('pullup') || name.includes('lat') || name.includes('deadlift') || name.includes('back')) {
    return 'Back';
  }
  if (name.includes('shoulder') || name.includes('press') || name.includes('lateral') || name.includes('delt') || name.includes('raise')) {
    return 'Shoulders';
  }
  if (name.includes('curl') || name.includes('tricep') || name.includes('bicep') || name.includes('extension') || name.includes('dip')) {
    return 'Arms';
  }
  if (name.includes('squat') || name.includes('leg') || name.includes('lunge') || name.includes('hamstring') || name.includes('quad')) {
    return 'Legs';
  }
  if (name.includes('ab') || name.includes('crunch') || name.includes('plank') || name.includes('core') || name.includes('oblique')) {
    return 'Core';
  }
  if (name.includes('glute') || name.includes('hip thrust') || name.includes('bridge')) {
    return 'Glutes';
  }
  if (name.includes('calf') || name.includes('calves')) {
    return 'Calves';
  }
  
  return 'Other';
}

export function analyzeMuscleGroups(history: WorkoutHistory[]): MuscleGroupStats[] {
  const muscleStats = new Map<string, MuscleGroupStats>();
  
  const allMuscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Calves', 'Other'];
  allMuscleGroups.forEach(mg => {
    muscleStats.set(mg, {
      muscleGroup: mg,
      totalSets: 0,
      totalVolume: 0,
      exerciseCount: 0,
      frequency: 0,
    });
  });

  const workoutDates = new Map<string, Set<string>>();

  history.forEach((workout) => {
    const workoutDate = new Date(workout.completedAt).toISOString().split('T')[0];
    
    workout.exercises.forEach((exercise) => {
      let muscleGroup = exercise.muscleGroup 
        ? (MUSCLE_GROUP_MAP[exercise.muscleGroup] || exercise.muscleGroup)
        : inferMuscleGroup(exercise.name);
      
      if (!muscleStats.has(muscleGroup)) {
        muscleGroup = 'Other';
      }

      const stats = muscleStats.get(muscleGroup)!;
      
      const completedSets = exercise.sets.filter(s => s.completed);
      const volume = completedSets.reduce((sum, set) => {
        if (set.weight && set.reps) {
          return sum + set.weight * set.reps;
        }
        return sum;
      }, 0);

      stats.totalSets += completedSets.length;
      stats.totalVolume += volume;
      stats.exerciseCount += 1;
      
      if (!stats.lastWorked || new Date(workout.completedAt) > new Date(stats.lastWorked)) {
        stats.lastWorked = workout.completedAt;
      }

      if (!workoutDates.has(muscleGroup)) {
        workoutDates.set(muscleGroup, new Set());
      }
      workoutDates.get(muscleGroup)!.add(workoutDate);
    });
  });

  workoutDates.forEach((dates, muscleGroup) => {
    const stats = muscleStats.get(muscleGroup);
    if (stats) {
      stats.frequency = dates.size;
    }
  });

  return Array.from(muscleStats.values())
    .filter(s => s.totalSets > 0 || allMuscleGroups.includes(s.muscleGroup))
    .sort((a, b) => b.totalVolume - a.totalVolume);
}

export function calculateStrengthProgress(
  currentHistory: WorkoutHistory[],
  previousHistory: WorkoutHistory[]
): StrengthProgress[] {
  const getCurrentMax = (history: WorkoutHistory[], exerciseName: string): number => {
    let maxWeight = 0;
    history.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.name === exerciseName) {
          exercise.sets.forEach(set => {
            if (set.completed && set.weight && set.weight > maxWeight) {
              maxWeight = set.weight;
            }
          });
        }
      });
    });
    return maxWeight;
  };

  const allExercises = new Set<string>();
  [...currentHistory, ...previousHistory].forEach(workout => {
    workout.exercises.forEach(exercise => {
      if (exercise.sets.some(s => s.completed && s.weight && s.weight > 0)) {
        allExercises.add(exercise.name);
      }
    });
  });

  const progress: StrengthProgress[] = [];
  
  allExercises.forEach(exerciseName => {
    const currentMax = getCurrentMax(currentHistory, exerciseName);
    const previousMax = getCurrentMax(previousHistory, exerciseName);
    
    if (currentMax > 0 || previousMax > 0) {
      const change = currentMax - previousMax;
      const changePercent = previousMax > 0 ? (change / previousMax) * 100 : 0;
      const trend: 'up' | 'down' | 'stable' = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
      
      progress.push({
        exerciseName,
        currentMax,
        previousMax,
        change,
        changePercent,
        trend,
      });
    }
  });

  return progress
    .filter(p => p.currentMax > 0)
    .sort((a, b) => b.currentMax - a.currentMax);
}

export function getMuscleGroupInsights(stats: MuscleGroupStats[]): {
  strong: MuscleGroupStats[];
  needsWork: MuscleGroupStats[];
  balanced: boolean;
} {
  const worked = stats.filter(s => s.totalSets > 0);
  
  if (worked.length === 0) {
    return { strong: [], needsWork: [], balanced: true };
  }

  const avgVolume = worked.reduce((sum, s) => sum + s.totalVolume, 0) / worked.length;
  const avgFrequency = worked.reduce((sum, s) => sum + s.frequency, 0) / worked.length;

  const strong = worked.filter(s => s.totalVolume > avgVolume * 1.3 || s.frequency > avgFrequency * 1.3);
  const needsWork = stats.filter(s => {
    if (s.totalSets === 0) return true;
    return s.totalVolume < avgVolume * 0.5 || s.frequency < avgFrequency * 0.5;
  });

  const balanced = strong.length <= 2 && needsWork.length <= 2;

  return {
    strong: strong.slice(0, 3),
    needsWork: needsWork.slice(0, 3),
    balanced,
  };
}
