import { z } from "zod";

/**
 * Environment variable schema with strict validation
 */
const envSchema = z.object({
  // Database Configuration
  DATABASE_URL: z
    .string({ message: "DATABASE_URL is required and must be a string" })
    .url("DATABASE_URL must be a valid URL")
    .min(1, "DATABASE_URL cannot be empty"),

  // Clerk Authentication (Server-side)
  CLERK_SECRET_KEY: z
    .string({ message: "CLERK_SECRET_KEY is required and must be a string" })
    .min(1, "CLERK_SECRET_KEY cannot be empty")
    .startsWith("sk_", "CLERK_SECRET_KEY must start with 'sk_'"),

  // Clerk Authentication (Client-side)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string({
      message:
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required and must be a string",
    })
    .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY cannot be empty")
    .startsWith(
      "pk_",
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with 'pk_'",
    ),

  // Optional: Application URL for short links
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .optional(),

  // Node Environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

/**
 * Validate environment variables at startup
 * Throws descriptive error if validation fails
 */
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error(
      "Environment variable validation failed. Check the errors above.",
    );
  }

  return parsed.data;
}

/**
 * Validated and typed environment variables
 * Safe to use throughout the application
 */
export const env = validateEnv();

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;
