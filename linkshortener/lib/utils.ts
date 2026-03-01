import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates that a URL is safe and uses only allowed protocols.
 * Prevents XSS attacks via javascript:, data:, file: and other dangerous protocols.
 * @param url - The URL string to validate
 * @returns true if the URL is safe (http/https), false otherwise
 */
export function isSafeUrl(url: string): boolean {
  // Basic validation: must be non-empty string
  if (!url || typeof url !== "string") {
    return false;
  }

  // Trim and normalize the URL
  const trimmedUrl = url.trim();

  // Reject empty after trimming
  if (!trimmedUrl) {
    return false;
  }

  try {
    // Parse the URL to validate its structure
    const parsedUrl = new URL(trimmedUrl);

    // Only allow http and https protocols
    // Reject: javascript:, data:, file:, blob:, ftp:, and any other protocol
    const allowedProtocols = ["http:", "https:"];

    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false;
    }

    // Ensure the URL has a valid hostname
    if (!parsedUrl.hostname) {
      return false;
    }

    return true;
  } catch {
    // If URL parsing fails, it's not a valid URL
    return false;
  }
}

/**
 * Sanitizes a URL by validating it's safe and normalizing it.
 * @param url - The URL string to sanitize
 * @returns The sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string): string | null {
  if (!isSafeUrl(url)) {
    return null;
  }

  try {
    // Parse and normalize the URL
    const parsedUrl = new URL(url.trim());
    return parsedUrl.toString();
  } catch {
    return null;
  }
}
