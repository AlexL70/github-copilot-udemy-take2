# Agent Instructions - Linkshortener Project

This document provides comprehensive coding standards, architectural patterns, and best practices for AI agents working on this Next.js link shortener application.

## 🎯 Project Overview

**Linkshortener** is a modern URL shortening service built with:

- **Next.js 16+** (App Router with Server Components)
- **TypeScript 5+** (strict mode)
- **PostgreSQL** (via Neon Serverless)
- **Drizzle ORM** (type-safe database operations)
- **Clerk** (authentication and user management)
- **Tailwind CSS v4** (utility-first styling with dark mode)
- **shadcn/ui** (accessible component primitives)

---

## 📚 Documentation Structure

Detailed guidelines are organized in the `/docs` directory. ALWAYS refer to the relevant .md file in the `/docs` directory BEFORE generating any code:

---

## ⚡ Quick Start for AI Agents

### Core Principles

1. ✅ **TypeScript strict mode** - Always use explicit types, never `any`
2. ✅ **Server Components first** - Default to Server Components, use `'use client'` only when necessary
3. ✅ **Type-safe database operations** - Use Drizzle ORM with proper type inference
4. ✅ **Clerk authentication** - Always verify `userId` before accessing user data
5. ✅ **Tailwind with `cn()` utility** - Use `cn()` from `@/lib/utils` for class merging
6. ✅ **Dark mode support** - Always include `dark:` variants for colored elements
7. ✅ **Error handling** - Provide user-friendly messages, log technical details
8. ✅ **Path alias** - Use `@/*` for all internal imports
9. ✅ **Validation first** - Always validate and sanitize user inputs
10. ✅ **Clean, self-documenting code** - Follow DRY, single responsibility principles

---

## 📂 Project Structure

```
/app                    # Next.js App Router (Server Components by default)
  /api                  # API route handlers (route.ts files)
  globals.css           # Global styles and Tailwind directives
  layout.tsx            # Root layout with Clerk provider
  page.tsx              # Home page

/db                     # Database layer
  index.ts              # Database client initialization
  schema.ts             # Drizzle schema definitions (all tables)

/lib                    # Shared utilities
  utils.ts              # Utility functions (cn, formatters, etc.)

/public                 # Static assets (images, fonts)

/docs                   # Detailed documentation for AI agents
  *.md                  # Specific guideline documents
```

### File Naming Conventions

- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **API Routes**: `route.ts` (Next.js convention)
- **Components**: `kebab-case.tsx` (e.g., `link-card.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `url-validators.ts`)
- **Route segments**: `kebab-case/` (e.g., `app/my-links/`)

---

## 🔧 TypeScript Standards

### Strict Mode Compliance

```typescript
// ✅ ALWAYS: Explicit types for function parameters and return values
export async function createShortLink(
  url: string,
  userId: string,
): Promise<{ success: boolean; data?: Link; error?: string }> {
  // implementation
}

// ❌ NEVER: Implicit any or missing return types
export async function createShortLink(url, userId) {
  // implementation
}
```

### Type Safety Rules

```typescript
// ✅ Use unknown for truly unknown types
function processData(data: unknown): ProcessedData {
  if (typeof data === "string") {
    return parseString(data);
  }
  throw new Error("Invalid data type");
}

// ❌ Never use 'any' type
function processData(data: any) {
  return data.something;
}

// ✅ Use proper union types
type Result<T> = { success: true; data: T } | { success: false; error: string };

// ✅ Leverage type inference from Drizzle schemas
import { links } from "@/db/schema";
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
```

### Import Path Alias

```typescript
// ✅ ALWAYS: Use @/* path alias
import { db } from "@/db";
import { links } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ❌ NEVER: Relative paths for cross-directory imports
import { db } from "../../db";
import { links } from "../../db/schema";
```

---

## ⚛️ Next.js App Router Patterns

### Server vs Client Components

**Server Components (Default)** - Use for:

- Data fetching from database
- Accessing backend resources
- Rendering static content
- SEO-critical content

```typescript
// app/dashboard/page.tsx (Server Component - no 'use client')
import { db } from '@/db';
import { links } from '@/db/schema';
import { auth } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Direct database access in Server Component
  const userLinks = await db
    .select()
    .from(links)
    .where(eq(links.userId, userId));

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Your Links</h1>
      <LinksList links={userLinks} />
    </div>
  );
}
```

**Client Components** - Use `'use client'` ONLY for:

- Event handlers (onClick, onChange, onSubmit)
- React hooks (useState, useEffect, useReducer)
- Browser APIs (localStorage, navigator, window)
- Real-time interactivity

```typescript
// link-card.tsx (Client Component)
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function LinkCard({ link }: { link: Link }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link.shortCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border p-4">
      <h3>{link.originalUrl}</h3>
      <Button onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy Link'}
      </Button>
    </div>
  );
}
```

### Server Actions

Use Server Actions for mutations and form handling:

```typescript
// app/actions/links.ts
"use server";

import { auth } from "@clerk/nextjs";
import { db } from "@/db";
import { links } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function createLink(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const url = formData.get("url") as string;

  // Validation
  if (!url || !isValidUrl(url)) {
    return { success: false, error: "Invalid URL" };
  }

  try {
    const shortCode = generateShortCode();

    const [newLink] = await db
      .insert(links)
      .values({
        originalUrl: url,
        shortCode,
        userId,
      })
      .returning();

    revalidatePath("/dashboard");

    return { success: true, data: newLink };
  } catch (error) {
    console.error("Failed to create link:", error);
    return { success: false, error: "Failed to create link" };
  }
}
```

### API Routes

```typescript
// app/api/links/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/db";
import { links } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userLinks = await db
      .select()
      .from(links)
      .where(eq(links.userId, userId));

    return NextResponse.json({ links: userLinks });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // Implementation
}
```

---

## 🗄️ Database & Drizzle ORM

### Schema Definitions

```typescript
// db/schema.ts - Define all tables here
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  shortCode: varchar("short_code", { length: 10 }).notNull().unique(),
  originalUrl: text("original_url").notNull(),
  userId: text("user_id").notNull(),
  title: text("title"),
  clicks: integer("clicks").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export inferred types
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
```

### Database Operations

```typescript
// ✅ Select with conditions
const userLinks = await db.select().from(links).where(eq(links.userId, userId));

// ✅ Insert with returning
const [newLink] = await db
  .insert(links)
  .values({ shortCode, originalUrl, userId })
  .returning();

// ✅ Update
await db
  .update(links)
  .set({ clicks: sql`${links.clicks} + 1` })
  .where(eq(links.id, linkId));

// ✅ Delete
await db
  .delete(links)
  .where(and(eq(links.id, linkId), eq(links.userId, userId)));

// ✅ Transactions
await db.transaction(async (tx) => {
  const [link] = await tx.insert(links).values(data).returning();
  await tx.insert(analytics).values({ linkId: link.id });
  return link;
});
```

### Environment Variables

```typescript
// db/index.ts
import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const db = drizzle(process.env.DATABASE_URL);
export { db };
```

**Required variables**:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key

---

## 🔐 Authentication with Clerk

### Server Component Authentication

```typescript
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // User is authenticated, proceed
  return <div>Protected content</div>;
}
```

### Client Component Authentication

```typescript
'use client';
import { useAuth } from '@clerk/nextjs';

export function UserProfile() {
  const { userId, isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <Spinner />;
  }

  if (!isSignedIn) {
    return <SignInPrompt />;
  }

  return <div>User: {userId}</div>;
}
```

### Layout with Clerk Components

```typescript
// app/layout.tsx
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header>
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## 🎨 Tailwind CSS & Styling

### Class Utility Function

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage in components
<div className={cn(
  "flex items-center gap-2",
  "rounded-lg border p-4",
  "bg-white dark:bg-zinc-900",
  isActive && "border-green-500",
  className
)} />
```

### Dark Mode Support

```tsx
// ✅ ALWAYS include dark mode variants
<div className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50">
  <h1 className="text-2xl font-bold text-black dark:text-white">Title</h1>
  <p className="text-zinc-600 dark:text-zinc-400">Description</p>
</div>

// ✅ Use semantic color tokens
bg-white dark:bg-black
text-zinc-900 dark:text-zinc-50
border-zinc-200 dark:border-zinc-800
```

### Responsive Design

```tsx
// Mobile-first approach
<div className={cn(
  "flex flex-col gap-4",        // Mobile: column
  "md:flex-row md:gap-6",       // Tablet+: row
  "lg:max-w-6xl lg:mx-auto",    // Desktop: centered container
)}>
```

---

## 🧩 Component Patterns

### Component Structure

```typescript
// link-card.tsx
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Link } from '@/db/schema';

interface LinkCardProps {
  link: Link;
  onDelete?: (id: number) => void;
  className?: string;
}

export function LinkCard({ link, onDelete, className }: LinkCardProps) {
  return (
    <div className={cn(
      "rounded-lg border border-zinc-200 p-4",
      "dark:border-zinc-800",
      className
    )}>
      <h3 className="font-semibold">{link.originalUrl}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {link.shortCode}
      </p>
      {onDelete && (
        <Button
          variant="destructive"
          onClick={() => onDelete(link.id)}
        >
          Delete
        </Button>
      )}
    </div>
  );
}
```

### Co-location Strategy

```
/app
  /dashboard
    page.tsx              # Main page
    link-card.tsx         # Component used only in dashboard
    stats-widget.tsx      # Component used only in dashboard
```

---

## ⚠️ Error Handling

### Database Operations

```typescript
async function createLink(url: string, userId: string): Promise<Result<Link>> {
  // Validate before database operations
  if (!isValidUrl(url)) {
    return { success: false, error: "Invalid URL format" };
  }

  try {
    const [newLink] = await db
      .insert(links)
      .values({ originalUrl: url, shortCode: generateCode(), userId })
      .returning();

    return { success: true, data: newLink };
  } catch (error) {
    console.error("Database error:", error);

    // Handle specific errors
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return { success: false, error: "Short code already exists" };
    }

    return { success: false, error: "Failed to create link" };
  }
}
```

### Error Boundaries

```tsx
// app/dashboard/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-zinc-600 dark:text-zinc-400">{error.message}</p>
        <button onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
```

---

## 🔒 Security Best Practices

### Input Validation

```typescript
// ✅ ALWAYS validate user inputs
function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function isValidShortCode(code: string): boolean {
  return /^[a-zA-Z0-9_-]{4,10}$/.test(code);
}
```

### Authorization

```typescript
// ✅ ALWAYS verify ownership before mutations
async function deleteLink(linkId: number, userId: string) {
  const [link] = await db
    .select()
    .from(links)
    .where(
      and(
        eq(links.id, linkId),
        eq(links.userId, userId), // Verify ownership
      ),
    )
    .limit(1);

  if (!link) {
    throw new Error("Link not found or unauthorized");
  }

  await db.delete(links).where(eq(links.id, linkId));
}
```

### SQL Injection Prevention

```typescript
// ✅ Drizzle ORM provides automatic protection
const links = await db
  .select()
  .from(linksTable)
  .where(eq(linksTable.userId, userId)); // Parameterized query

// ❌ Never construct raw SQL from user input
// const links = await db.execute(`SELECT * FROM links WHERE user_id = '${userId}'`);
```

---

## 🎯 Code Quality Standards

### Naming Conventions

```typescript
// ✅ Variables and functions: camelCase
const userId = "user_123";
const isActive = true;
function getUserLinks(userId: string) {}

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_URL_LENGTH = 2048;
const DEFAULT_SHORT_CODE_LENGTH = 6;

// ✅ Types and Interfaces: PascalCase
interface LinkCardProps {}
type LinkStatus = "active" | "inactive";

// ✅ Components: PascalCase
export function LinkCard() {}
export default function DashboardPage() {}

// ✅ Files: kebab-case
// link-card.tsx, user-profile.tsx, url-validators.ts

// ✅ Database columns: snake_case
(short_code, original_url, created_at);
```

### Code Organization

```typescript
// ✅ Function length: 10-50 lines ideal
// ✅ Single responsibility per function
// ✅ Early returns to reduce nesting

function processLink(link: Link | null) {
  if (!link) return null;
  if (link.expired) return null;
  return formatLink(link);
}

// ✅ Extract common logic into utilities
function formatShortUrl(shortCode: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/${shortCode}`;
}
```

### Comments

```typescript
// ✅ Comment WHY, not WHAT
// Using base62 encoding to keep short codes URL-safe and human-readable
const shortCode = encodeBase62(randomId);

// ✅ JSDoc for public APIs
/**
 * Creates a shortened link for the given URL.
 * @param url - The URL to shorten
 * @param userId - The user creating the link
 * @returns The created link with short code
 */
export async function createLink(url: string, userId: string): Promise<Link> {
  // implementation
}

// ❌ Don't state the obvious
// Increment counter
counter++;
```

---

## ✅ Pre-Commit Checklist

Before submitting code, verify:

- [ ] TypeScript strict mode passes (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All imports use `@/*` path alias
- [ ] Server/Client Component boundaries are correct
- [ ] Authentication checks are in place for protected operations
- [ ] Database queries use Drizzle ORM (no raw SQL)
- [ ] Error handling provides user-friendly messages
- [ ] Dark mode is supported with `dark:` variants
- [ ] Input validation is implemented
- [ ] No sensitive data is logged or exposed
- [ ] Function names are descriptive and follow conventions
- [ ] Components are properly typed with explicit interfaces

---

## 🚀 Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npx drizzle-kit generate # Generate migration from schema
npx drizzle-kit push     # Push schema to database (dev only)
npx drizzle-kit studio   # Open Drizzle Studio (database GUI)

# Type Checking
npx tsc --noEmit         # Type check without emitting files
```

---

## 📖 Additional Resources

For detailed information on specific topics, consult:

- Next.js 16 App Router: https://nextjs.org/docs
- Drizzle ORM: https://orm.drizzle.team
- Clerk Authentication: https://clerk.com/docs
- Tailwind CSS v4: https://tailwindcss.com/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs

---

## 💡 AI Agent Workflow

When implementing features:

1. **Understand requirements** - Clarify what needs to be built
2. **Check authentication** - Determine if feature requires auth
3. **Design schema** - Update `db/schema.ts` if database changes needed
4. **Choose component type** - Server Component (default) or Client Component
5. **Implement with types** - Write TypeScript with explicit types
6. **Add validation** - Validate all user inputs
7. **Handle errors** - Provide user-friendly error messages
8. **Style with Tailwind** - Include dark mode support
9. **Test thoroughly** - Verify functionality and edge cases
10. **Review checklist** - Ensure all standards are met

---

## 🎓 Summary

This project follows modern Next.js 16+ App Router patterns with:

- **Server Components by default** for better performance
- **Type-safe database operations** with Drizzle ORM
- **Secure authentication** with Clerk
- **Beautiful, accessible UI** with Tailwind CSS and dark mode
- **Strict TypeScript** for reliability
- **Clean code practices** for maintainability

When in doubt, prefer simplicity, type safety, and user experience.
