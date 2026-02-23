"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLink } from "@/data/links";

// Define Zod schema for validation
const createLinkSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
  shortCode: z
    .string()
    .regex(/^[a-zA-Z0-9_-]*$/, "Short code can only contain letters, numbers, hyphens, and underscores")
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
