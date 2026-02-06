import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { dietRouter } from "./routes/diet";
import { exampleRouter } from "./routes/example";
import { workoutsRouter, exercisesRouter } from "./routes/workouts";
import { nutritionRouter } from "./routes/nutrition";
import { progressRouter } from "./routes/progress";
import { aiRouter } from "./routes/ai";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  diet: dietRouter,
  auth: authRouter,
  workouts: workoutsRouter,
  exercises: exercisesRouter,
  nutrition: nutritionRouter,
  progress: progressRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
