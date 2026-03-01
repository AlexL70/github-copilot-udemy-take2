import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "@/lib/env";

/**
 * Database connection pool configuration
 * 
 * Connection pool limits prevent connection exhaustion attacks and ensure
 * efficient resource usage in serverless environments.
 * 
 * Configuration:
 * - max: 10 - Maximum number of database connections in the pool
 *   (Conservative limit suitable for serverless; prevents overwhelming the database)
 * - idleTimeoutMillis: 30000 - Close idle connections after 30 seconds
 *   (Reduces resource usage while maintaining performance for active requests)
 * - connectionTimeoutMillis: 10000 - Maximum time to wait for a connection
 *   (Prevents indefinite waiting and improves error handling)
 * 
 * These limits protect against:
 * - Connection exhaustion from too many concurrent requests
 * - Resource leaks from idle connections
 * - Denial of service from connection flooding
 * 
 * Environment variables are validated at import time via @/lib/env
 */
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10, // Maximum 10 concurrent connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Wait max 10 seconds for a connection
});

// Initialize Drizzle ORM with the Neon connection pool
const db = drizzle(pool);

export { db };
