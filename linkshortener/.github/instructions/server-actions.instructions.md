---
description: Read this before implementing or modifying any server actions in the project.
applyTo: **/actions.ts
---

# Server Actions Guidelines

## Overview

**All data mutations in this application must be performed via Server Actions.** This ensures type safety, proper validation, and secure data handling.

---

## Core Principles

1. ✅ **Server Actions for Mutations** - ALL data mutations (create, update, delete) must use Server Actions
2. ✅ **Call from Client Components** - Server Actions must be called from Client Components
3. ✅ **Naming Convention** - Server Actions files MUST be named `actions.ts`
4. ✅ **Co-location** - Place `actions.ts` in the same directory as the component that calls it
5. ✅ **TypeScript Types** - Use proper TypeScript types for all data (NEVER use `FormData` type)
6. ✅ **Zod Validation** - ALL data MUST be validated using Zod schemas
7. ✅ **Authentication First** - Check for logged-in user before any database operations
8. ✅ **Use Data Layer** - Call helper functions from `/data` directory (NEVER use Drizzle queries directly)
9. ✅ **Never Throw Errors** - Server actions MUST NEVER throw errors; always return result objects

---

## File Structure

Server Actions must be co-located with their consuming components:

```
/app
  /dashboard
    page.tsx           # Client component that calls actions
    actions.ts         # Server actions for dashboard
  /links
    link-form.tsx      # Client component that calls actions
    actions.ts         # Server actions for links
```

---

## Server Action Template

```typescript
// app/dashboard/actions.ts
"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLink, updateLink, deleteLink } from "@/data/links";

// Define Zod schema for validation
const createLinkSchema = z.object({
  originalUrl: z.string().url("Invalid URL format"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title too long")
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
      error: validation.error.errors[0].message,
    };
  }

  try {
    // 3. Call data layer helper function (NOT direct Drizzle query)
    const result = await createLink({
      originalUrl: validation.data.originalUrl,
      title: validation.data.title,
      userId,
    });

    // 4. Revalidate relevant paths
    revalidatePath("/dashboard");

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create link:", error);
    return { success: false, error: "Failed to create link" };
  }
}
```

---

## Calling Server Actions from Client Components

```typescript
// app/dashboard/link-form.tsx
'use client';

import { useState } from 'react';
import { createLinkAction } from './actions';
import { Button } from '@/components/ui/button';

export function LinkForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Call server action with typed data (NOT FormData)
    const result = await createLinkAction({
      originalUrl: url
    });

    if (result.success) {
      setUrl('');
      // Handle success
    } else {
      // Handle error
      alert(result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Link'}
      </Button>
    </form>
  );
}
```

---

## Validation with Zod

All server actions MUST validate input using Zod:

```typescript
import { z } from "zod";

// Define schema
const updateLinkSchema = z.object({
  linkId: z.number().int().positive(),
  title: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

// Use in server action
export async function updateLinkAction(input: unknown) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  // Validate
  const validation = updateLinkSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }

  // Use validated data
  const result = await updateLink(validation.data.linkId, {
    title: validation.data.title,
    isActive: validation.data.isActive,
    userId, // For authorization check
  });

  revalidatePath("/dashboard");
  return { success: true, data: result };
}
```

---

## Common Validation Schemas

```typescript
// URL validation
const urlSchema = z.string().url("Must be a valid URL");

// Optional custom short code
const shortCodeSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]{4,10}$/, "Invalid short code format")
  .optional();

// Date validation
const expiresAtSchema = z.string().datetime().or(z.date()).optional();

// Pagination
const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
```

---

## Return Type Pattern

**CRITICAL: Server actions MUST NEVER throw errors.** All server actions must follow this return type pattern:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function myAction(input: Input): Promise<ActionResult<Output>> {
  // Implementation
}
```

### Rules for Return Values

1. ✅ **ALWAYS return an object** - Never throw errors, always return result objects
2. ✅ **Success case** - Return `{ success: true, data: T }` when operation succeeds
3. ✅ **Error case** - Return `{ success: false, error: string }` when operation fails
4. ✅ **Catch all errors** - Wrap all database operations in try-catch blocks
5. ✅ **User-friendly messages** - Return descriptive error messages for the UI

```typescript
// ✅ CORRECT: Always returns result object
export async function createAction(input: Input): Promise<ActionResult<Link>> {
  try {
    const result = await createLink(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create link" };
  }
}

// ❌ WRONG: Throws error instead of returning error object
export async function createAction(input: Input): Promise<Link> {
  const result = await createLink(input);
  return result; // Will throw if createLink fails
}

// ❌ WRONG: Throws error explicitly
export async function createAction(input: Input): Promise<ActionResult<Link>> {
  if (!input.url) {
    throw new Error("URL is required"); // NEVER do this
  }
  // ...
}
```

---

## Authentication Check

ALWAYS check authentication before proceeding:

```typescript
export async function deleteAction(linkId: number) {
  // ✅ ALWAYS: Check auth first
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // Proceed with operation
  await deleteLink(linkId, userId);
  revalidatePath("/dashboard");

  return { success: true };
}
```

---

## Data Layer Integration

Server actions MUST use helper functions from `/data` directory:

```typescript
// ✅ CORRECT: Use data layer helpers
import { createLink, updateLink, deleteLink } from "@/data/links";

export async function createLinkAction(input: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  // Use helper from /data directory
  const result = await createLink({ ...input, userId });

  return { success: true, data: result };
}

// ❌ WRONG: Direct Drizzle query
export async function createLinkAction(input: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  // NEVER do this in server actions
  const [link] = await db
    .insert(links)
    .values({ ...input, userId })
    .returning();

  return { success: true, data: link };
}
```

---

## Revalidation

After successful mutations, revalidate relevant paths:

```typescript
import { revalidatePath } from "next/cache";

export async function updateLinkAction(input: UpdateLinkInput) {
  // ... authentication and validation

  const result = await updateLink(input.linkId, input.data, userId);

  // Revalidate the dashboard and specific link pages
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/links/${input.linkId}`);

  return { success: true, data: result };
}
```

---

## Error Handling

**CRITICAL: Server actions MUST NEVER throw errors.** Always catch errors and return error objects.

### Error Handling Rules

1. ✅ **Wrap all operations in try-catch** - Prevent unhandled errors
2. ✅ **Return error objects** - Never throw, always return `{ success: false, error: string }`
3. ✅ **Log for debugging** - Use `console.error()` to log technical details
4. ✅ **User-friendly messages** - Return messages users can understand
5. ✅ **Handle specific errors** - Check error types and provide contextual messages

```typescript
export async function createLinkAction(input: CreateLinkInput) {
  // Authentication check - return error object if unauthorized
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // Validation - return error object if invalid
  const validation = createLinkSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message, // User-friendly Zod error
    };
  }

  // Database operations - wrap in try-catch and return error objects
  try {
    const result = await createLink({ ...validation.data, userId });
    revalidatePath("/dashboard");
    return { success: true, data: result };
  } catch (error) {
    console.error("Create link error:", error); // Log for debugging

    // Return specific error messages based on error type
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false, error: "Short code already exists" };
    }

    // Always return generic error as fallback
    return { success: false, error: "Failed to create link" };
  }
}
```

### Common Error Patterns

```typescript
// ✅ Authentication error
const { userId } = await auth();
if (!userId) {
  return { success: false, error: "You must be signed in" };
}

// ✅ Validation error
const validation = schema.safeParse(input);
if (!validation.success) {
  return { success: false, error: validation.error.errors[0].message };
}

// ✅ Authorization error
if (resource.userId !== userId) {
  return { success: false, error: "You don't have permission to do this" };
}

// ✅ Not found error
if (!resource) {
  return { success: false, error: "Resource not found" };
}

// ✅ Database error
try {
  await databaseOperation();
} catch (error) {
  console.error(error);
  return { success: false, error: "Operation failed" };
}
```

---

## Checklist for Server Actions

Before submitting a server action, verify:

- [ ] File is named `actions.ts`
- [ ] File is in same directory as calling component
- [ ] File starts with `"use server";` directive
- [ ] Authentication check is first operation
- [ ] All inputs are validated with Zod
- [ ] Uses proper TypeScript types (NOT `FormData`)
- [ ] Calls helper functions from `/data` directory
- [ ] NO direct Drizzle queries in action
- [ ] Revalidates relevant paths after mutations
- [ ] Returns structured result object (`{ success: true/false }`)
- [ ] NEVER throws errors - always returns error objects
- [ ] All database operations wrapped in try-catch
- [ ] Includes proper error handling with user-friendly messages

---

## Examples

### Create Action

```typescript
"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLink } from "@/data/links";

const schema = z.object({
  originalUrl: z.string().url(),
});

type Input = z.infer<typeof schema>;

export async function createLinkAction(input: Input) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const validation = schema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  try {
    const link = await createLink({ ...validation.data, userId });
    revalidatePath("/dashboard");
    return { success: true, data: link };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create link" };
  }
}
```

### Update Action

```typescript
"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateLink } from "@/data/links";

const schema = z.object({
  linkId: z.number().int().positive(),
  title: z.string().min(1).max(100).optional(),
});

type Input = z.infer<typeof schema>;

export async function updateLinkAction(input: Input) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const validation = schema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  try {
    const link = await updateLink(
      validation.data.linkId,
      { title: validation.data.title },
      userId,
    );
    revalidatePath("/dashboard");
    return { success: true, data: link };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update link" };
  }
}
```

### Delete Action

```typescript
"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteLink } from "@/data/links";

const schema = z.object({
  linkId: z.number().int().positive(),
});

type Input = z.infer<typeof schema>;

export async function deleteLinkAction(input: Input) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const validation = schema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  try {
    await deleteLink(validation.data.linkId, userId);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete link" };
  }
}
```
