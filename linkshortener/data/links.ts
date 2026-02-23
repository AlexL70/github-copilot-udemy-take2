import { db } from "@/db";
import { links, type Link } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Fetches all links for a specific user, ordered by creation date (newest first).
 * @param userId - The Clerk user ID
 * @returns Array of links owned by the user
 */
export async function getUserLinks(userId: string): Promise<Link[]> {
  return await db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.createdAt));
}
