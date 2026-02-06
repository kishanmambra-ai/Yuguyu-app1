import { db } from "./index";
import { exercises } from "./schema";

const defaultExercises = [
  { name: "Bench Press", muscleGroup: "chest", equipment: "barbell" },
  { name: "Incline Dumbbell Press", muscleGroup: "chest", equipment: "dumbbell" },
  { name: "Cable Fly", muscleGroup: "chest", equipment: "cable" },
  { name: "Push-ups", muscleGroup: "chest", equipment: "bodyweight" },
  
  { name: "Pull-ups", muscleGroup: "back", equipment: "bodyweight" },
  { name: "Barbell Row", muscleGroup: "back", equipment: "barbell" },
  { name: "Lat Pulldown", muscleGroup: "back", equipment: "cable" },
  { name: "Seated Cable Row", muscleGroup: "back", equipment: "cable" },
  { name: "Deadlift", muscleGroup: "back", equipment: "barbell" },
  
  { name: "Overhead Press", muscleGroup: "shoulders", equipment: "barbell" },
  { name: "Lateral Raise", muscleGroup: "shoulders", equipment: "dumbbell" },
  { name: "Face Pull", muscleGroup: "shoulders", equipment: "cable" },
  { name: "Rear Delt Fly", muscleGroup: "shoulders", equipment: "dumbbell" },
  
  { name: "Barbell Curl", muscleGroup: "biceps", equipment: "barbell" },
  { name: "Dumbbell Curl", muscleGroup: "biceps", equipment: "dumbbell" },
  { name: "Hammer Curl", muscleGroup: "biceps", equipment: "dumbbell" },
  { name: "Preacher Curl", muscleGroup: "biceps", equipment: "barbell" },
  
  { name: "Tricep Pushdown", muscleGroup: "triceps", equipment: "cable" },
  { name: "Skull Crushers", muscleGroup: "triceps", equipment: "barbell" },
  { name: "Overhead Tricep Extension", muscleGroup: "triceps", equipment: "dumbbell" },
  { name: "Dips", muscleGroup: "triceps", equipment: "bodyweight" },
  
  { name: "Squat", muscleGroup: "legs", equipment: "barbell" },
  { name: "Leg Press", muscleGroup: "legs", equipment: "machine" },
  { name: "Romanian Deadlift", muscleGroup: "legs", equipment: "barbell" },
  { name: "Leg Curl", muscleGroup: "legs", equipment: "machine" },
  { name: "Leg Extension", muscleGroup: "legs", equipment: "machine" },
  { name: "Lunges", muscleGroup: "legs", equipment: "dumbbell" },
  { name: "Calf Raise", muscleGroup: "legs", equipment: "machine" },
  
  { name: "Crunches", muscleGroup: "core", equipment: "bodyweight" },
  { name: "Plank", muscleGroup: "core", equipment: "bodyweight" },
  { name: "Cable Crunch", muscleGroup: "core", equipment: "cable" },
  { name: "Hanging Leg Raise", muscleGroup: "core", equipment: "bodyweight" },
  { name: "Russian Twist", muscleGroup: "core", equipment: "bodyweight" },
];

export async function seedExercises() {
  console.log("Seeding default exercises...");
  
  for (const exercise of defaultExercises) {
    try {
      await db
        .insert(exercises)
        .values({
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment,
          isCustom: false,
        })
        .onConflictDoNothing();
    } catch (error) {
      console.log(`Exercise ${exercise.name} may already exist`);
    }
  }
  
  console.log("Seeding complete!");
}

if (require.main === module) {
  seedExercises()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
