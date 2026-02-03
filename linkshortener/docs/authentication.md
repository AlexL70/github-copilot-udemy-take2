# Authentication Guidelines

## Overview

**All authentication in this application is handled exclusively by Clerk.** No other authentication methods should be implemented.

---

## Core Principles

1. ✅ **Clerk Only** - Use Clerk for all authentication and user management
2. ✅ **Modal Sign-In** - Always launch sign-in/sign-up flows as modals
3. ✅ **Protected Routes** - Require authentication for `/dashboard` and related pages. Redirect unauthenticated users back to home page.
4. ✅ **Smart Redirects** - Redirect authenticated users from homepage to dashboard

---

## Protected Routes

### Dashboard Route Protection

The `/dashboard` page and all nested routes must require authentication:

```typescript
// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // User is authenticated - render dashboard
  return <div>Dashboard Content</div>;
}
```

---

## Homepage Redirect

If a user is already authenticated and visits the homepage, redirect them to the dashboard:

```typescript
// app/page.tsx
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  // User is not authenticated - show landing page
  return <div>Welcome to Link Shortener</div>;
}
```

---

## Modal Sign-In/Sign-Up

Always use modal mode for authentication flows:

```typescript
// In layout or navigation component
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function Navigation() {
  return (
    <nav>
      <SignedOut>
        <SignInButton mode="modal">
          <button>Sign In</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button>Sign Up</button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </nav>
  );
}
```

---

## Server Components Authentication

For Server Components, use `auth()` from `@clerk/nextjs`:

```typescript
import { auth } from '@clerk/nextjs';

export default async function ServerComponent() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in</div>;
  }

  // Proceed with authenticated logic
  return <div>User ID: {userId}</div>;
}
```

---

## Client Components Authentication

For Client Components, use the `useAuth()` hook:

```typescript
'use client';
import { useAuth } from '@clerk/nextjs';

export function ClientComponent() {
  const { userId, isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>User ID: {userId}</div>;
}
```

---

## Database Operations with User ID

Always verify `userId` before database operations involving user data:

```typescript
import { auth } from "@clerk/nextjs";
import { db } from "@/db";
import { links } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserLinks() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Safe to query user-specific data
  return await db.select().from(links).where(eq(links.userId, userId));
}
```

---

## Conditional UI Rendering

Use Clerk's helper components for conditional rendering:

```typescript
import { SignedIn, SignedOut } from '@clerk/nextjs';

export function ConditionalContent() {
  return (
    <>
      <SignedOut>
        <p>Public content for logged-out users</p>
      </SignedOut>
      <SignedIn>
        <p>Private content for logged-in users</p>
      </SignedIn>
    </>
  );
}
```

---

## Environment Variables

Required Clerk environment variables:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Optional (for customization):

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## Route Protection Patterns

### Middleware Approach (Optional)

For protecting multiple routes at once, use Clerk middleware:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/links(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

---

## Anti-Patterns (DO NOT USE)

❌ **Never implement custom authentication**:

- No custom JWT handling
- No custom session management
- No custom password hashing
- No custom OAuth implementations

❌ **Never bypass Clerk authentication**:

```typescript
// ❌ BAD: Accepting userId from client
export async function createLink(userId: string, url: string) {
  // User could fake their ID!
}

// ✅ GOOD: Always get userId from Clerk
export async function createLink(url: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  // Use verified userId from Clerk
}
```

❌ **Never use redirect mode for sign-in/sign-up**:

```typescript
// ❌ BAD: Full page redirect
<SignInButton mode="redirect">Sign In</SignInButton>

// ✅ GOOD: Modal
<SignInButton mode="modal">Sign In</SignInButton>
```

---

## Summary

- **Clerk handles 100% of authentication** - no exceptions
- **Modal mode for all auth flows** - better UX
- **Protect dashboard routes** - require authentication
- **Redirect logged-in users** - from homepage to dashboard
- **Always verify userId** - on server before database operations
- **Use Clerk components** - `SignedIn`, `SignedOut`, `UserButton`, etc.

When implementing any feature involving users, always start by retrieving the `userId` from Clerk's `auth()` or `useAuth()`.
