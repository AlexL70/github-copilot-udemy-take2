"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLink, updateLink, deleteLink } from "@/data/links";
import { isSafeUrl } from "@/lib/utils";

// Define Zod schema for validation
const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) => isSafeUrl(url),
      "URL must use http:// or https:// protocol only",
    ),
  shortCode: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]*$/,
      "Short code can only contain letters, numbers, hyphens, and underscores",
    )
    .min(0)
    .max(10, "Short code must be 10 characters or less")
    .optional(),
});

type CreateLinkInput = z.infer<typeof createLinkSchema>;

export async function createLinkAction(input: CreateLinkInput) {
  // 1. Check authentication first
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Validate input with Zod
  const validation = createLinkSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  try {
    // 3. Call data layer helper function
    const result = await createLink({
      originalUrl: validation.data.originalUrl,
      userId,
      shortCode: validation.data.shortCode,
    });

    // 4. Revalidate relevant paths
    revalidatePath("/dashboard");

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create link:", error);
    return { success: false, error: "Failed to create link" };
  }
}

// Define Zod schema for updating links
const updateLinkSchema = z.object({
  linkId: z.number(),
  originalUrl: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) => isSafeUrl(url),
      "URL must use http:// or https:// protocol only",
    ),
  shortCode: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Short code can only contain letters, numbers, hyphens, and underscores",
    )
    .min(1, "Short code cannot be empty")
    .max(10, "Short code must be 10 characters or less"),
});

type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

export async function updateLinkAction(input: UpdateLinkInput) {
  // 1. Check authentication first
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Validate input with Zod
  const validation = updateLinkSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  try {
    // 3. Call data layer helper function
    const result = await updateLink(validation.data.linkId, userId, {
      originalUrl: validation.data.originalUrl,
      shortCode: validation.data.shortCode,
    });

    // 4. Revalidate relevant paths
    revalidatePath("/dashboard");

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update link:", error);

    // Handle specific error messages
    if (
      error instanceof Error &&
      error.message === "Link not found or unauthorized"
    ) {
      return { success: false, error: "Link not found or unauthorized" };
    }

    return { success: false, error: "Failed to update link" };
  }
}

// Define Zod schema for deleting links
const deleteLinkSchema = z.object({
  linkId: z.number(),
});

type DeleteLinkInput = z.infer<typeof deleteLinkSchema>;

export async function deleteLinkAction(input: DeleteLinkInput) {
  // 1. Check authentication first
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Validate input with Zod
  const validation = deleteLinkSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  try {
    // 3. Call data layer helper function
    await deleteLink(validation.data.linkId, userId);

    // 4. Revalidate relevant paths
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete link:", error);

    // Handle specific error messages
    if (
      error instanceof Error &&
      error.message === "Link not found or unauthorized"
    ) {
      return { success: false, error: "Link not found or unauthorized" };
    }

    return { success: false, error: "Failed to delete link" };
  }
}
