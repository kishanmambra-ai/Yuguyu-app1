import { pgTable, text, timestamp, uuid, integer, real, boolean, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  profileImageUrl: text("profile_image_url"),
  height: real("height"),
  weight: real("weight"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"),
  activityLevel: text("activity_level"),
  fitnessGoal: text("fitness_goal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const passwordResetCodes = pgTable("password_reset_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  equipment: text("equipment"),
  isCustom: boolean("is_custom").default(false).notNull(),
  instructions: text("instructions"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  notes: text("notes"),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"),
  totalVolume: real("total_volume"),
  caloriesBurned: integer("calories_burned"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutId: uuid("workout_id").notNull().references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id),
  order: integer("order").notNull(),
  notes: text("notes"),
});

export const exerciseSets = pgTable("exercise_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutExerciseId: uuid("workout_exercise_id").notNull().references(() => workoutExercises.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  weight: real("weight"),
  reps: integer("reps"),
  duration: integer("duration"),
  distance: real("distance"),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cardioSessions = pgTable("cardio_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(),
  duration: integer("duration").notNull(),
  distance: real("distance"),
  calories: integer("calories"),
  avgHeartRate: integer("avg_heart_rate"),
  maxHeartRate: integer("max_heart_rate"),
  notes: text("notes"),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meals = pgTable("meals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  mealType: text("meal_type").notNull(),
  date: date("date").notNull(),
  totalCalories: integer("total_calories").default(0),
  totalProtein: real("total_protein").default(0),
  totalCarbs: real("total_carbs").default(0),
  totalFat: real("total_fat").default(0),
  notes: text("notes"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const foodEntries = pgTable("food_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  mealId: uuid("meal_id").notNull().references(() => meals.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  servingSize: real("serving_size").notNull(),
  servingUnit: text("serving_unit").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").default(0),
  carbs: real("carbs").default(0),
  fat: real("fat").default(0),
  fiber: real("fiber").default(0),
  sugar: real("sugar").default(0),
  sodium: real("sodium").default(0),
  barcode: text("barcode"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nutritionGoals = pgTable("nutrition_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  dailyCalories: integer("daily_calories").default(2000),
  dailyProtein: real("daily_protein").default(150),
  dailyCarbs: real("daily_carbs").default(200),
  dailyFat: real("daily_fat").default(65),
  dailyFiber: real("daily_fiber").default(25),
  dailyWater: real("daily_water").default(8),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  weight: real("weight"),
  bodyFat: real("body_fat"),
  muscleMass: real("muscle_mass"),
  chest: real("chest"),
  waist: real("waist"),
  hips: real("hips"),
  arms: real("arms"),
  thighs: real("thighs"),
  notes: text("notes"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const personalRecords = pgTable("personal_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id),
  weight: real("weight").notNull(),
  reps: integer("reps").notNull(),
  oneRepMax: real("one_rep_max"),
  achievedAt: timestamp("achieved_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waterLogs = pgTable("water_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  glasses: integer("glasses").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favoriteFoods = pgTable("favorite_foods", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  portion: text("portion").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").default(0),
  carbs: real("carbs").default(0),
  fat: real("fat").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  workouts: many(workouts),
  cardioSessions: many(cardioSessions),
  meals: many(meals),
  progress: many(userProgress),
  exercises: many(exercises),
  personalRecords: many(personalRecords),
  nutritionGoals: one(nutritionGoals),
  waterLogs: many(waterLogs),
  passwordResetCodes: many(passwordResetCodes),
  favoriteFoods: many(favoriteFoods),
}));

export const favoriteFoodsRelations = relations(favoriteFoods, ({ one }) => ({
  user: one(users, { fields: [favoriteFoods.userId], references: [users.id] }),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, { fields: [workouts.userId], references: [users.id] }),
  exercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, { fields: [workoutExercises.workoutId], references: [workouts.id] }),
  exercise: one(exercises, { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
  sets: many(exerciseSets),
}));

export const exerciseSetsRelations = relations(exerciseSets, ({ one }) => ({
  workoutExercise: one(workoutExercises, { fields: [exerciseSets.workoutExerciseId], references: [workoutExercises.id] }),
}));

export const mealsRelations = relations(meals, ({ one, many }) => ({
  user: one(users, { fields: [meals.userId], references: [users.id] }),
  foodEntries: many(foodEntries),
}));

export const foodEntriesRelations = relations(foodEntries, ({ one }) => ({
  meal: one(meals, { fields: [foodEntries.mealId], references: [meals.id] }),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  user: one(users, { fields: [exercises.userId], references: [users.id] }),
  workoutExercises: many(workoutExercises),
  personalRecords: many(personalRecords),
}));

export const personalRecordsRelations = relations(personalRecords, ({ one }) => ({
  user: one(users, { fields: [personalRecords.userId], references: [users.id] }),
  exercise: one(exercises, { fields: [personalRecords.exerciseId], references: [exercises.id] }),
}));

export const cardioSessionsRelations = relations(cardioSessions, ({ one }) => ({
  user: one(users, { fields: [cardioSessions.userId], references: [users.id] }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
}));

export const nutritionGoalsRelations = relations(nutritionGoals, ({ one }) => ({
  user: one(users, { fields: [nutritionGoals.userId], references: [users.id] }),
}));

export const waterLogsRelations = relations(waterLogs, ({ one }) => ({
  user: one(users, { fields: [waterLogs.userId], references: [users.id] }),
}));

export const passwordResetCodesRelations = relations(passwordResetCodes, ({ one }) => ({
  user: one(users, { fields: [passwordResetCodes.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type ExerciseSet = typeof exerciseSets.$inferSelect;
export type CardioSession = typeof cardioSessions.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type FoodEntry = typeof foodEntries.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type PersonalRecord = typeof personalRecords.$inferSelect;
export type NutritionGoals = typeof nutritionGoals.$inferSelect;
export type FavoriteFood = typeof favoriteFoods.$inferSelect;
