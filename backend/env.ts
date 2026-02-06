import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  SENDGRID_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.flatten();
    const errors = Object.entries(formatted.fieldErrors)
      .map(([key, messages]) => `  ${key}: ${messages?.join(", ")}`)
      .join("\n");
    
    console.error("Environment validation failed:\n" + errors);
    
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment configuration");
    }
  }

  cachedEnv = result.success ? result.data : (process.env as unknown as Env);
  return cachedEnv;
}

export function validateEnv(): void {
  getEnv();
}

export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}
