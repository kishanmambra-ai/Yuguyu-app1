import { Exercise } from "@/types/workout";

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  exercises: Omit<Exercise, 'id'>[];
}

const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "ss-workout-a",
    name: "Starting Strength - Workout A",
    description: "Classic beginner strength program by Mark Rippetoe. Focus on linear progression with compound lifts.",
    category: "Strength",
    exercises: [
      {
        name: "Back Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Flat Barbell Bench Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Deadlift",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "ss-workout-b",
    name: "Starting Strength - Workout B",
    description: "Alternate workout day focusing on overhead press and power cleans.",
    category: "Strength",
    exercises: [
      {
        name: "Back Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Overhead Barbell Press",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Power Clean",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 3, weight: 0, completed: false },
          { id: "2", reps: 3, weight: 0, completed: false },
          { id: "3", reps: 3, weight: 0, completed: false },
          { id: "4", reps: 3, weight: 0, completed: false },
          { id: "5", reps: 3, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "sl-5x5-a",
    name: "StrongLifts 5x5 - Workout A",
    description: "Squat, Bench, Row. Add 2.5kg/5lbs each workout. Alternate with Workout B.",
    category: "Strength",
    exercises: [
      {
        name: "Back Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
          { id: "4", reps: 5, weight: 0, completed: false },
          { id: "5", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Flat Barbell Bench Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
          { id: "4", reps: 5, weight: 0, completed: false },
          { id: "5", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Bent-Over Barbell Row",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
          { id: "4", reps: 5, weight: 0, completed: false },
          { id: "5", reps: 5, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "sl-5x5-b",
    name: "StrongLifts 5x5 - Workout B",
    description: "Squat, Overhead Press, Deadlift. Add 2.5kg/5lbs each workout. Alternate with Workout A.",
    category: "Strength",
    exercises: [
      {
        name: "Back Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
          { id: "4", reps: 5, weight: 0, completed: false },
          { id: "5", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Overhead Barbell Press",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
          { id: "4", reps: 5, weight: 0, completed: false },
          { id: "5", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Deadlift",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "ppl-push",
    name: "PPL Push Day",
    description: "Reddit PPL program - chest, shoulders, triceps. Run 6 days/week with Pull and Legs.",
    category: "Push/Pull/Legs",
    exercises: [
      {
        name: "Flat Barbell Bench Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
          { id: "4", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Overhead Barbell Press",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Incline Dumbbell Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Lateral Raise",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
          { id: "3", reps: 15, weight: 0, completed: false },
        ],
      },
      {
        name: "Rope Pushdown",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Overhead Dumbbell Extension",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "ppl-pull",
    name: "PPL Pull Day",
    description: "Reddit PPL program - back and biceps. Focus on rowing and vertical pulling.",
    category: "Push/Pull/Legs",
    exercises: [
      {
        name: "Deadlift",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Pull-Ups (Wide Grip)",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Seated Cable Row",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Face Pull",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
          { id: "3", reps: 15, weight: 0, completed: false },
        ],
      },
      {
        name: "Barbell Curl",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Hammer Curl",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "ppl-legs",
    name: "PPL Leg Day",
    description: "Reddit PPL program - quads, hamstrings, glutes, calves.",
    category: "Push/Pull/Legs",
    exercises: [
      {
        name: "Back Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
          { id: "4", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Romanian Deadlift",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Leg Press",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Leg Extension",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Lying Leg Curl Machine",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Standing Calf Raise Machine",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
          { id: "3", reps: 15, weight: 0, completed: false },
          { id: "4", reps: 15, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "phul-upper-power",
    name: "PHUL Upper Power",
    description: "Power Hypertrophy Upper Lower - upper body power day. Heavy compounds for strength.",
    category: "Upper/Lower",
    exercises: [
      {
        name: "Flat Barbell Bench Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
          { id: "4", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Incline Dumbbell Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Bent-Over Barbell Row",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
          { id: "4", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Lat Pulldown (Wide Grip)",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Overhead Barbell Press",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 6, weight: 0, completed: false },
          { id: "2", reps: 6, weight: 0, completed: false },
        ],
      },
      {
        name: "Barbell Curl",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Skull Crusher",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "phul-lower-power",
    name: "PHUL Lower Power",
    description: "Power Hypertrophy Upper Lower - lower body power day. Heavy squats and deadlifts.",
    category: "Upper/Lower",
    exercises: [
      {
        name: "Back Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
          { id: "4", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Deadlift",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Leg Press",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Lying Leg Curl Machine",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Standing Calf Raise Machine",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "phul-upper-hypertrophy",
    name: "PHUL Upper Hypertrophy",
    description: "Power Hypertrophy Upper Lower - upper body hypertrophy. Higher reps for muscle growth.",
    category: "Upper/Lower",
    exercises: [
      {
        name: "Incline Barbell Bench Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Cable Fly",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Seated Cable Row",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Single-Arm Dumbbell Row",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Lateral Raise",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Incline Dumbbell Curl",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Rope Pushdown",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "phul-lower-hypertrophy",
    name: "PHUL Lower Hypertrophy",
    description: "Power Hypertrophy Upper Lower - lower body hypertrophy. Volume work for leg development.",
    category: "Upper/Lower",
    exercises: [
      {
        name: "Front Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Bulgarian Split Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Romanian Deadlift",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Leg Extension",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
          { id: "3", reps: 15, weight: 0, completed: false },
        ],
      },
      {
        name: "Lying Leg Curl Machine",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
          { id: "3", reps: 15, weight: 0, completed: false },
        ],
      },
      {
        name: "Seated Calf Raise",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
          { id: "3", reps: 15, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "full-body-a",
    name: "Full Body Workout A",
    description: "3x/week full body training. Alternates with Workout B for balanced development.",
    category: "Full Body",
    exercises: [
      {
        name: "Back Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Flat Barbell Bench Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Bent-Over Barbell Row",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Shoulder Press",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Romanian Deadlift",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Plank",
        muscleGroup: "CORE",
        sets: [
          { id: "1", time: 60, completed: false },
          { id: "2", time: 60, completed: false },
        ],
      },
    ],
  },
  {
    id: "full-body-b",
    name: "Full Body Workout B",
    description: "3x/week full body training. Different movement patterns from Workout A.",
    category: "Full Body",
    exercises: [
      {
        name: "Deadlift",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Overhead Barbell Press",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Pull-Ups (Wide Grip)",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Bulgarian Split Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Incline Dumbbell Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Hanging Leg Raise",
        muscleGroup: "CORE",
        sets: [
          { id: "1", reps: 12, completed: false },
          { id: "2", reps: 12, completed: false },
        ],
      },
    ],
  },
  {
    id: "bro-chest",
    name: "Bro Split - Chest Day",
    description: "Classic bodybuilding chest workout. High volume for maximum chest development.",
    category: "Bro Split",
    exercises: [
      {
        name: "Flat Barbell Bench Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
          { id: "4", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Incline Dumbbell Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Decline Barbell Bench Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Cable Fly",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Machine Chest Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "bro-back",
    name: "Bro Split - Back Day",
    description: "Classic bodybuilding back workout. Width and thickness focused.",
    category: "Bro Split",
    exercises: [
      {
        name: "Deadlift",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Pull-Ups (Wide Grip)",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Bent-Over Barbell Row",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Seated Cable Row",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Lat Pulldown (Close Grip)",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "bro-shoulders",
    name: "Bro Split - Shoulder Day",
    description: "Classic bodybuilding shoulder workout. All three delt heads targeted.",
    category: "Bro Split",
    exercises: [
      {
        name: "Overhead Barbell Press",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
          { id: "4", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Lateral Raise",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
          { id: "4", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Face Pull",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
          { id: "3", reps: 15, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Front Raise",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Machine Shoulder Press",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Barbell Shrug",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
          { id: "3", reps: 15, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "bro-arms",
    name: "Bro Split - Arms Day",
    description: "Classic bodybuilding arm workout. Biceps and triceps superset heaven.",
    category: "Bro Split",
    exercises: [
      {
        name: "Barbell Curl",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Close-Grip Bench Press",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Incline Dumbbell Curl",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Skull Crusher",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Hammer Curl",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Rope Pushdown",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
        ],
      },
      {
        name: "Preacher Curl Machine",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "bro-legs",
    name: "Bro Split - Leg Day",
    description: "Classic bodybuilding leg workout. Quads, hams, glutes, and calves.",
    category: "Bro Split",
    exercises: [
      {
        name: "Back Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
          { id: "4", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Romanian Deadlift",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Leg Press",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Leg Extension",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
          { id: "3", reps: 15, weight: 0, completed: false },
        ],
      },
      {
        name: "Lying Leg Curl Machine",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Standing Calf Raise Machine",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 15, weight: 0, completed: false },
          { id: "2", reps: 15, weight: 0, completed: false },
          { id: "3", reps: 15, weight: 0, completed: false },
          { id: "4", reps: 15, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "beginner-full-body",
    name: "Beginner Full Body",
    description: "Perfect for those starting their fitness journey. Simple movements, 3x per week.",
    category: "Beginner",
    exercises: [
      {
        name: "Goblet Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Standard Push-up",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
          { id: "3", reps: 10, completed: false },
        ],
      },
      {
        name: "Dumbbell Row (Both Arms)",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Shoulder Press",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Plank",
        muscleGroup: "CORE",
        sets: [
          { id: "1", time: 30, completed: false },
          { id: "2", time: 30, completed: false },
          { id: "3", time: 30, completed: false },
        ],
      },
    ],
  },
  {
    id: "beginner-upper",
    name: "Beginner Upper Body",
    description: "Build upper body strength with simple, effective movements.",
    category: "Beginner",
    exercises: [
      {
        name: "Incline Push-Up",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 12, completed: false },
          { id: "2", reps: 12, completed: false },
          { id: "3", reps: 12, completed: false },
        ],
      },
      {
        name: "Assisted Pull-Up Machine",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 8, weight: 0, completed: false },
          { id: "2", reps: 8, weight: 0, completed: false },
          { id: "3", reps: 8, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Shoulder Press",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Curl",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Rope Pushdown",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "beginner-lower",
    name: "Beginner Lower Body",
    description: "Strengthen legs and glutes with beginner-friendly exercises.",
    category: "Beginner",
    exercises: [
      {
        name: "Bodyweight Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 15, completed: false },
          { id: "2", reps: 15, completed: false },
          { id: "3", reps: 15, completed: false },
        ],
      },
      {
        name: "Walking Lunge",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
          { id: "3", reps: 10, completed: false },
        ],
      },
      {
        name: "Leg Press",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Lying Leg Curl Machine",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Glute Bridge",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 15, completed: false },
          { id: "2", reps: 15, completed: false },
          { id: "3", reps: 15, completed: false },
        ],
      },
    ],
  },
  {
    id: "hiit-full-body",
    name: "HIIT Full Body Blast",
    description: "High intensity interval training. 30 seconds work, 15 seconds rest.",
    category: "HIIT",
    exercises: [
      {
        name: "Burpees",
        muscleGroup: "CARDIO",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
          { id: "3", reps: 10, completed: false },
        ],
      },
      {
        name: "Mountain Climbers",
        muscleGroup: "CARDIO",
        sets: [
          { id: "1", time: 30, completed: false },
          { id: "2", time: 30, completed: false },
          { id: "3", time: 30, completed: false },
        ],
      },
      {
        name: "Jump Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 15, completed: false },
          { id: "2", reps: 15, completed: false },
          { id: "3", reps: 15, completed: false },
        ],
      },
      {
        name: "Standard Push-up",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 15, completed: false },
          { id: "2", reps: 15, completed: false },
          { id: "3", reps: 15, completed: false },
        ],
      },
      {
        name: "High Knees",
        muscleGroup: "CARDIO",
        sets: [
          { id: "1", time: 30, completed: false },
          { id: "2", time: 30, completed: false },
          { id: "3", time: 30, completed: false },
        ],
      },
      {
        name: "Plank to Push-Up",
        muscleGroup: "CORE",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
          { id: "3", reps: 10, completed: false },
        ],
      },
    ],
  },
  {
    id: "hiit-tabata",
    name: "Tabata Protocol",
    description: "Classic 4-minute Tabata rounds. 20 seconds max effort, 10 seconds rest x 8.",
    category: "HIIT",
    exercises: [
      {
        name: "Jumping Jacks",
        muscleGroup: "CARDIO",
        sets: [
          { id: "1", time: 20, completed: false },
          { id: "2", time: 20, completed: false },
          { id: "3", time: 20, completed: false },
          { id: "4", time: 20, completed: false },
        ],
      },
      {
        name: "Bodyweight Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", time: 20, completed: false },
          { id: "2", time: 20, completed: false },
          { id: "3", time: 20, completed: false },
          { id: "4", time: 20, completed: false },
        ],
      },
      {
        name: "Standard Push-up",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", time: 20, completed: false },
          { id: "2", time: 20, completed: false },
          { id: "3", time: 20, completed: false },
          { id: "4", time: 20, completed: false },
        ],
      },
      {
        name: "Burpees",
        muscleGroup: "CARDIO",
        sets: [
          { id: "1", time: 20, completed: false },
          { id: "2", time: 20, completed: false },
          { id: "3", time: 20, completed: false },
          { id: "4", time: 20, completed: false },
        ],
      },
    ],
  },
  {
    id: "home-dumbbell",
    name: "Home Dumbbell Workout",
    description: "Effective full body workout with just a pair of dumbbells.",
    category: "Home",
    exercises: [
      {
        name: "Goblet Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Floor Press",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Single-Arm Dumbbell Row",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Shoulder Press",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Romanian Deadlift",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
          { id: "3", reps: 12, weight: 0, completed: false },
        ],
      },
      {
        name: "Dumbbell Curl",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, weight: 0, completed: false },
          { id: "2", reps: 12, weight: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: "home-bodyweight",
    name: "Home Bodyweight Only",
    description: "No equipment needed. Effective workout using just your bodyweight.",
    category: "Home",
    exercises: [
      {
        name: "Bodyweight Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 20, completed: false },
          { id: "2", reps: 20, completed: false },
          { id: "3", reps: 20, completed: false },
        ],
      },
      {
        name: "Standard Push-up",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 15, completed: false },
          { id: "2", reps: 15, completed: false },
          { id: "3", reps: 15, completed: false },
        ],
      },
      {
        name: "Walking Lunge",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, completed: false },
          { id: "2", reps: 12, completed: false },
          { id: "3", reps: 12, completed: false },
        ],
      },
      {
        name: "Pike Push-Up",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
          { id: "3", reps: 10, completed: false },
        ],
      },
      {
        name: "Glute Bridge",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 15, completed: false },
          { id: "2", reps: 15, completed: false },
          { id: "3", reps: 15, completed: false },
        ],
      },
      {
        name: "Plank",
        muscleGroup: "CORE",
        sets: [
          { id: "1", time: 45, completed: false },
          { id: "2", time: 45, completed: false },
          { id: "3", time: 45, completed: false },
        ],
      },
      {
        name: "Superman Hold",
        muscleGroup: "BACK",
        sets: [
          { id: "1", time: 30, completed: false },
          { id: "2", time: 30, completed: false },
          { id: "3", time: 30, completed: false },
        ],
      },
    ],
  },
  {
    id: "calisthenics-basics",
    name: "Calisthenics Fundamentals",
    description: "Master the basics of bodyweight training. Foundation for advanced movements.",
    category: "Calisthenics",
    exercises: [
      {
        name: "Pull-Up",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", reps: 8, completed: false },
          { id: "2", reps: 8, completed: false },
          { id: "3", reps: 8, completed: false },
        ],
      },
      {
        name: "Dips",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
          { id: "3", reps: 10, completed: false },
        ],
      },
      {
        name: "Diamond Push-Up",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", reps: 12, completed: false },
          { id: "2", reps: 12, completed: false },
          { id: "3", reps: 12, completed: false },
        ],
      },
      {
        name: "Pistol Squat (Assisted)",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", reps: 6, completed: false },
          { id: "2", reps: 6, completed: false },
          { id: "3", reps: 6, completed: false },
        ],
      },
      {
        name: "Hanging Leg Raise",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
          { id: "3", reps: 10, completed: false },
        ],
      },
      {
        name: "L-Sit Hold",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", time: 15, completed: false },
          { id: "2", time: 15, completed: false },
          { id: "3", time: 15, completed: false },
        ],
      },
    ],
  },
  {
    id: "calisthenics-advanced",
    name: "Advanced Calisthenics",
    description: "High-skill bodyweight movements for experienced athletes.",
    category: "Calisthenics",
    exercises: [
      {
        name: "Muscle-Up",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", reps: 5, completed: false },
          { id: "2", reps: 5, completed: false },
          { id: "3", reps: 5, completed: false },
        ],
      },
      {
        name: "Handstand Push-Up",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", reps: 8, completed: false },
          { id: "2", reps: 8, completed: false },
          { id: "3", reps: 8, completed: false },
        ],
      },
      {
        name: "Archer Push-Up",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", reps: 8, completed: false },
          { id: "2", reps: 8, completed: false },
          { id: "3", reps: 8, completed: false },
        ],
      },
      {
        name: "Front Lever Raise",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", reps: 5, completed: false },
          { id: "2", reps: 5, completed: false },
          { id: "3", reps: 5, completed: false },
        ],
      },
      {
        name: "Pistol Squat",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", reps: 8, completed: false },
          { id: "2", reps: 8, completed: false },
          { id: "3", reps: 8, completed: false },
        ],
      },
      {
        name: "Dragon Flag",
        muscleGroup: "CALISTHENICS",
        sets: [
          { id: "1", reps: 6, completed: false },
          { id: "2", reps: 6, completed: false },
          { id: "3", reps: 6, completed: false },
        ],
      },
    ],
  },
  {
    id: "quick-15-upper",
    name: "Quick 15 - Upper Body",
    description: "15-minute upper body blast when you're short on time.",
    category: "Quick Workouts",
    exercises: [
      {
        name: "Standard Push-up",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 15, completed: false },
          { id: "2", reps: 15, completed: false },
        ],
      },
      {
        name: "Pull-Ups (Wide Grip)",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
        ],
      },
      {
        name: "Pike Push-Up",
        muscleGroup: "SHOULDERS",
        sets: [
          { id: "1", reps: 12, completed: false },
          { id: "2", reps: 12, completed: false },
        ],
      },
      {
        name: "Diamond Push-Up",
        muscleGroup: "ARMS",
        sets: [
          { id: "1", reps: 12, completed: false },
          { id: "2", reps: 12, completed: false },
        ],
      },
    ],
  },
  {
    id: "quick-15-lower",
    name: "Quick 15 - Lower Body",
    description: "15-minute lower body blast when you're short on time.",
    category: "Quick Workouts",
    exercises: [
      {
        name: "Bodyweight Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 20, completed: false },
          { id: "2", reps: 20, completed: false },
        ],
      },
      {
        name: "Jump Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, completed: false },
          { id: "2", reps: 12, completed: false },
        ],
      },
      {
        name: "Walking Lunge",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 12, completed: false },
          { id: "2", reps: 12, completed: false },
        ],
      },
      {
        name: "Glute Bridge",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 15, completed: false },
          { id: "2", reps: 15, completed: false },
        ],
      },
      {
        name: "Calf Raise (Bodyweight)",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 20, completed: false },
          { id: "2", reps: 20, completed: false },
        ],
      },
    ],
  },
  {
    id: "quick-15-core",
    name: "Quick 15 - Core Crusher",
    description: "15-minute intense core workout. No equipment needed.",
    category: "Quick Workouts",
    exercises: [
      {
        name: "Plank",
        muscleGroup: "CORE",
        sets: [
          { id: "1", time: 45, completed: false },
          { id: "2", time: 45, completed: false },
        ],
      },
      {
        name: "Mountain Climbers",
        muscleGroup: "CORE",
        sets: [
          { id: "1", reps: 20, completed: false },
          { id: "2", reps: 20, completed: false },
        ],
      },
      {
        name: "Bicycle Crunch",
        muscleGroup: "CORE",
        sets: [
          { id: "1", reps: 20, completed: false },
          { id: "2", reps: 20, completed: false },
        ],
      },
      {
        name: "Lying Leg Raise",
        muscleGroup: "CORE",
        sets: [
          { id: "1", reps: 15, completed: false },
          { id: "2", reps: 15, completed: false },
        ],
      },
      {
        name: "Dead Bug",
        muscleGroup: "CORE",
        sets: [
          { id: "1", reps: 12, completed: false },
          { id: "2", reps: 12, completed: false },
        ],
      },
    ],
  },
  {
    id: "athletic-power",
    name: "Athletic Power Development",
    description: "Explosive movements for athletic performance and power.",
    category: "Athletic",
    exercises: [
      {
        name: "Box Jump",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 8, completed: false },
          { id: "2", reps: 8, completed: false },
          { id: "3", reps: 8, completed: false },
        ],
      },
      {
        name: "Medicine Ball Slam",
        muscleGroup: "CORE",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
          { id: "3", reps: 10, completed: false },
        ],
      },
      {
        name: "Power Clean",
        muscleGroup: "BACK",
        sets: [
          { id: "1", reps: 5, weight: 0, completed: false },
          { id: "2", reps: 5, weight: 0, completed: false },
          { id: "3", reps: 5, weight: 0, completed: false },
        ],
      },
      {
        name: "Jump Squat",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
          { id: "3", reps: 10, completed: false },
        ],
      },
      {
        name: "Plyometric Push-Up",
        muscleGroup: "CHEST",
        sets: [
          { id: "1", reps: 8, completed: false },
          { id: "2", reps: 8, completed: false },
          { id: "3", reps: 8, completed: false },
        ],
      },
      {
        name: "Sprint Intervals",
        muscleGroup: "CARDIO",
        sets: [
          { id: "1", time: 30, completed: false },
          { id: "2", time: 30, completed: false },
          { id: "3", time: 30, completed: false },
          { id: "4", time: 30, completed: false },
        ],
      },
    ],
  },
  {
    id: "athletic-agility",
    name: "Athletic Agility & Speed",
    description: "Improve quickness, agility, and reaction time.",
    category: "Athletic",
    exercises: [
      {
        name: "Ladder Drills",
        muscleGroup: "CARDIO",
        sets: [
          { id: "1", time: 60, completed: false },
          { id: "2", time: 60, completed: false },
          { id: "3", time: 60, completed: false },
        ],
      },
      {
        name: "Lateral Shuffle",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", time: 30, completed: false },
          { id: "2", time: 30, completed: false },
          { id: "3", time: 30, completed: false },
        ],
      },
      {
        name: "Cone Drills",
        muscleGroup: "CARDIO",
        sets: [
          { id: "1", time: 45, completed: false },
          { id: "2", time: 45, completed: false },
          { id: "3", time: 45, completed: false },
        ],
      },
      {
        name: "Burpees",
        muscleGroup: "CARDIO",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
          { id: "3", reps: 10, completed: false },
        ],
      },
      {
        name: "High Knees",
        muscleGroup: "CARDIO",
        sets: [
          { id: "1", time: 30, completed: false },
          { id: "2", time: 30, completed: false },
          { id: "3", time: 30, completed: false },
        ],
      },
      {
        name: "Single-Leg Hop",
        muscleGroup: "LEGS",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
          { id: "3", reps: 10, completed: false },
        ],
      },
    ],
  },
  {
    id: "yoga-strength",
    name: "Yoga Strength Flow",
    description: "Build strength and flexibility with yoga-based movements.",
    category: "Yoga",
    exercises: [
      {
        name: "Sun Salutation A",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", reps: 5, completed: false },
        ],
      },
      {
        name: "Warrior I Hold",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 45, completed: false },
          { id: "2", time: 45, completed: false },
        ],
      },
      {
        name: "Warrior II Hold",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 45, completed: false },
          { id: "2", time: 45, completed: false },
        ],
      },
      {
        name: "Chair Pose Hold",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 30, completed: false },
          { id: "2", time: 30, completed: false },
        ],
      },
      {
        name: "Chaturanga (Yoga Push-Up)",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", reps: 10, completed: false },
          { id: "2", reps: 10, completed: false },
        ],
      },
      {
        name: "Boat Pose Hold",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 30, completed: false },
          { id: "2", time: 30, completed: false },
        ],
      },
      {
        name: "Crow Pose Practice",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 20, completed: false },
          { id: "2", time: 20, completed: false },
          { id: "3", time: 20, completed: false },
        ],
      },
    ],
  },
  {
    id: "yoga-flexibility",
    name: "Yoga Flexibility & Recovery",
    description: "Improve mobility and aid recovery with gentle stretching.",
    category: "Yoga",
    exercises: [
      {
        name: "Downward Dog Hold",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 60, completed: false },
        ],
      },
      {
        name: "Pigeon Pose",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 90, completed: false },
        ],
      },
      {
        name: "Forward Fold",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 60, completed: false },
        ],
      },
      {
        name: "Lizard Pose",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 60, completed: false },
        ],
      },
      {
        name: "Child's Pose",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 60, completed: false },
        ],
      },
      {
        name: "Supine Twist",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 60, completed: false },
        ],
      },
      {
        name: "Happy Baby",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 60, completed: false },
        ],
      },
      {
        name: "Savasana",
        muscleGroup: "YOGA",
        sets: [
          { id: "1", time: 180, completed: false },
        ],
      },
    ],
  },
];

export const templateCategories = [
  "Strength",
  "Push/Pull/Legs",
  "Upper/Lower",
  "Full Body",
  "Bro Split",
  "Beginner",
  "HIIT",
  "Home",
  "Calisthenics",
  "Quick Workouts",
  "Athletic",
  "Yoga",
];

export function getTemplatesByCategory(category: string): WorkoutTemplate[] {
  return workoutTemplates.filter(t => t.category === category);
}

export function getTemplateById(id: string): WorkoutTemplate | undefined {
  return workoutTemplates.find(t => t.id === id);
}

export function searchTemplates(query: string): WorkoutTemplate[] {
  const lowerQuery = query.toLowerCase();
  return workoutTemplates.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.category.toLowerCase().includes(lowerQuery)
  );
}

export { workoutTemplates };
