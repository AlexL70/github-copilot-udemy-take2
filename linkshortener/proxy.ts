import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Maximum request body size: 1MB (in bytes)
const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB

/**
 * Middleware combining Clerk authentication with request body size limits.
 * Checks Content-Length header for mutation requests to prevent DoS attacks.
 */
export default clerkMiddleware((auth, request) => {
  const { pathname } = request.nextUrl;

  // Only check size for mutation requests (POST, PUT, PATCH, DELETE)
  const isWriteRequest = ["POST", "PUT", "PATCH", "DELETE"].includes(
    request.method,
  );

  if (!isWriteRequest) {
    return NextResponse.next();
  }

  // Skip size check for static assets and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check Content-Length header
  const contentLength = request.headers.get("content-length");

  if (contentLength) {
    const size = parseInt(contentLength, 10);

    // Return 413 Payload Too Large if size exceeds limit
    if (size > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        {
          error: "Payload Too Large",
          message: `Request body size (${size} bytes) exceeds maximum allowed size (${MAX_REQUEST_SIZE} bytes)`,
          maxSize: MAX_REQUEST_SIZE,
        },
        { status: 413 },
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
