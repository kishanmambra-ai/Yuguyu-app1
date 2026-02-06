export interface WorkoutSet {
  id: string;
  reps?: number;
  time?: number;
  weight?: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
  notes?: string;
  muscleGroup?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
  lastPerformed?: string;
}

export interface ActiveWorkout {
  routineId: string;
  routine: WorkoutRoutine;
  startedAt: string;
  currentExerciseIndex: number;
}

export interface WorkoutHistory {
  id: string;
  routineId: string;
  routineName: string;
  exercises: Exercise[];
  startedAt: string;
  completedAt: string;
  totalSets: number;
  totalReps: number;
}

export type ActivityType = 'running' | 'cycling' | 'walking' | 'hiking' | 'indoor_run' | 'indoor_walk';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number;
  speed?: number;
}

export interface CardioActivity {
  id: string;
  type: ActivityType;
  startedAt: string;
  completedAt?: string;
  duration: number;
  distance: number;
  averagePace?: number;
  averageSpeed?: number;
  calories?: number;
  route: LocationPoint[];
  pausedDuration?: number;
  steps?: number;
}

export interface ActiveCardioActivity {
  type: ActivityType;
  startedAt: string;
  pausedAt?: string;
  totalPausedDuration: number;
  distance: number;
  route: LocationPoint[];
  isTracking: boolean;
  steps?: number;
  initialSteps?: number;
  currentSpeed?: number;
}
