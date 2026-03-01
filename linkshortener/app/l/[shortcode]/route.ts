import { NextRequest, NextResponse } from "next/server";
import { getLinkByShortCode } from "@/data/links";
import { isSafeUrl } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortcode: string }> },
) {
  try {
    const { shortcode } = await params;

    // Validate shortcode format
    if (!shortcode || typeof shortcode !== "string") {
      return NextResponse.json(
        { error: "Invalid short code" },
        { status: 400 },
      );
    }

    // Look up the link in the database
    const link = await getLinkByShortCode(shortcode);

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Security: Validate URL before redirecting to prevent XSS attacks
    if (!isSafeUrl(link.originalUrl)) {
      console.error(
        `Unsafe URL detected for shortcode ${shortcode}: ${link.originalUrl}`,
      );
      return NextResponse.json(
        { error: "Invalid redirect URL" },
        { status: 400 },
      );
    }

    // Redirect to the original URL
    return NextResponse.redirect(link.originalUrl, { status: 307 });
  } catch (error) {
    console.error("Error redirecting link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
