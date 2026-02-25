import { db } from "@/db";
import { links, type Link, type NewLink } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

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
 * Fetches a link by its short code.
 * @param shortCode - The short code to look up
 * @returns The link if found, null otherwise
 */
export async function getLinkByShortCode(shortCode: string): Promise<Link | null> {
  const [link] = await db
    .select()
    .from(links)
    .where(eq(links.shortCode, shortCode))
    .limit(1);

  return link || null;
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

/**
 * Updates an existing link. Verifies ownership before updating.
 * @param linkId - The ID of the link to update
 * @param userId - The user ID to verify ownership
 * @param data - The data to update (originalUrl and/or shortCode)
 * @returns The updated link
 * @throws Error if link not found or user is not the owner
 */
export async function updateLink(
  linkId: number,
  userId: string,
  data: {
    originalUrl?: string;
    shortCode?: string;
  }
): Promise<Link> {
  // First, verify the link exists and belongs to the user
  const [existingLink] = await db
    .select()
    .from(links)
    .where(and(eq(links.id, linkId), eq(links.userId, userId)))
    .limit(1);

  if (!existingLink) {
    throw new Error("Link not found or unauthorized");
  }

  // Update the link
  const [updatedLink] = await db
    .update(links)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(links.id, linkId))
    .returning();

  return updatedLink;
}

/**
 * Deletes a link. Verifies ownership before deleting.
 * @param linkId - The ID of the link to delete
 * @param userId - The user ID to verify ownership
 * @throws Error if link not found or user is not the owner
 */
export async function deleteLink(
  linkId: number,
  userId: string
): Promise<void> {
  // First, verify the link exists and belongs to the user
  const [existingLink] = await db
    .select()
    .from(links)
    .where(and(eq(links.id, linkId), eq(links.userId, userId)))
    .limit(1);

  if (!existingLink) {
    throw new Error("Link not found or unauthorized");
  }

  // Delete the link
  await db.delete(links).where(eq(links.id, linkId));
}
