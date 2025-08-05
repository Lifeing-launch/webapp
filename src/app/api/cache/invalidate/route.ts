import { NextRequest, NextResponse } from "next/server";
import {
  invalidateCache,
  invalidateAllCaches,
  revalidatePathCache,
} from "@/utils/cache";

/**
 * Cache invalidation API endpoint
 *
 * Usage:
 * POST /api/cache/invalidate
 * Body: { contentType: 'COACHES' | 'PLANS' | 'RESOURCES' | 'ARTICLES' | 'ANNOUNCEMENTS' | 'ALL' }
 *
 * Or for specific path:
 * POST /api/cache/invalidate
 * Body: { path: '/api/coaches' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentType, path } = body;

    // Validate request
    if (!contentType && !path) {
      return NextResponse.json(
        { error: "Missing required field: contentType or path" },
        { status: 400 }
      );
    }

    let result;

    if (path) {
      // Invalidate specific path
      result = await revalidatePathCache(path);
    } else if (contentType === "ALL") {
      // Invalidate all caches
      result = await invalidateAllCaches();
    } else {
      // Invalidate specific content type
      result = await invalidateCache(contentType);
    }

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to list available cache types
 */
export async function GET() {
  return NextResponse.json({
    availableContentTypes: [
      "COACHES",
      "PLANS",
      "RESOURCES",
      "ARTICLES",
      "ANNOUNCEMENTS",
      "ALL",
    ],
    usage: {
      invalidateContentType: {
        method: "POST",
        body: { contentType: "COACHES" },
      },
      invalidatePath: {
        method: "POST",
        body: { path: "/api/coaches" },
      },
      invalidateAll: {
        method: "POST",
        body: { contentType: "ALL" },
      },
    },
  });
}
