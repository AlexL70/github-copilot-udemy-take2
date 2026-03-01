import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Validate environment variables before using them
// This ensures DATABASE_URL is properly formatted
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
