import { NextRequest, NextResponse } from "next/server";
import { invalidateCache, CACHE_TAGS } from "@/utils/cache";

/**
 * CMS Webhook endpoint for automatic cache invalidation
 *
 * This endpoint should be called by your CMS (Strapi) when content is updated
 *
 * Expected webhook payload:
 * {
 *   "model": "coach" | "resource" | "subscription-plan" | "announcement",
 *   "action": "create" | "update" | "delete",
 *   "entry": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, action } = body;

    // Validate webhook payload
    if (!model || !action) {
      return NextResponse.json(
        { error: "Missing required fields: model, action" },
        { status: 400 }
      );
    }

    // Map CMS models to cache types
    const modelToCacheType: Record<string, keyof typeof CACHE_TAGS> = {
      coach: "COACHES",
      resource: "RESOURCES",
      "subscription-plan": "PLANS",
      announcement: "ANNOUNCEMENTS",
    };

    const cacheType = modelToCacheType[model];

    if (!cacheType) {
      console.warn(`Unknown model type: ${model}`);
      return NextResponse.json({
        message: `Unknown model type: ${model}`,
        cacheInvalidated: false,
      });
    }

    // Invalidate cache for the updated content type
    const result = await invalidateCache(cacheType);

    console.log(
      `CMS webhook: ${action} on ${model} - Cache invalidated: ${result.success}`
    );

    return NextResponse.json({
      success: result.success,
      message: `Cache invalidated for ${model} after ${action}`,
      model,
      action,
      cacheType,
    });
  } catch (error) {
    console.error("CMS webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to test webhook connectivity
 */
export async function GET() {
  return NextResponse.json({
    message: "CMS webhook endpoint is active",
    usage: {
      method: "POST",
      body: {
        model: "coach",
        action: "create",
        entry: "Content data...",
      },
    },
    supportedModels: ["coach", "resource", "subscription-plan", "announcement"],
    supportedActions: ["create", "update", "delete"],
  });
}
