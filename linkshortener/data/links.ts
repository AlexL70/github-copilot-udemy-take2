import { db } from "@/db";
import { links, type Link, type NewLink } from "@/db/schema";
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

/**
 * Generates a random short code for a link.
 * @returns A random 6-character alphanumeric string
 */
function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Creates a new shortened link.
 * @param data - The link data (originalUrl, userId, and optional shortCode)
 * @returns The created link
 */
export async function createLink(data: {
  originalUrl: string;
  userId: string;
  shortCode?: string;
}): Promise<Link> {
  const shortCode = data.shortCode || generateShortCode();

  const [newLink] = await db
    .insert(links)
    .values({
      originalUrl: data.originalUrl,
      shortCode,
      userId: data.userId,
    })
    .returning();

  return newLink;
}
