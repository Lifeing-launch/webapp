import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Cache invalidation utilities for Next.js
 */

// Cache tags for different content types
export const CACHE_TAGS = {
  COACHES: "coaches",
  PLANS: "plans",
  RESOURCES: "resources",
  ARTICLES: "articles",
  ANNOUNCEMENTS: "announcements",
} as const;

/**
 * Invalidate cache for specific content type
 */
export async function invalidateCache(contentType: keyof typeof CACHE_TAGS) {
  const tag = CACHE_TAGS[contentType];

  try {
    // Revalidate by tag
    revalidateTag(tag);

    // Also revalidate common paths
    switch (contentType) {
      case "COACHES":
        revalidatePath("/api/coaches");
        revalidatePath("/coaching");
        break;
      case "PLANS":
        revalidatePath("/api/payment/plans");
        revalidatePath("/auth/plans");
        revalidatePath("/subscription");
        break;
      case "RESOURCES":
        revalidatePath("/api/resources");
        revalidatePath("/resources");
        revalidatePath("/audio-resources");
        break;
      case "ARTICLES":
        revalidatePath("/api/resources");
        revalidatePath("/resources");
        break;
      case "ANNOUNCEMENTS":
        revalidatePath("/api/announcements");
        revalidatePath("/dashboard");
        break;
    }

    console.log(`Cache invalidated for ${contentType}`);
    return { success: true, message: `Cache invalidated for ${contentType}` };
  } catch (error) {
    console.error(`Failed to invalidate cache for ${contentType}:`, error);
    return {
      success: false,
      error: `Failed to invalidate cache for ${contentType}`,
    };
  }
}

/**
 * Invalidate all caches
 */
export async function invalidateAllCaches() {
  try {
    // Revalidate all tags
    Object.values(CACHE_TAGS).forEach((tag) => {
      revalidateTag(tag);
    });

    // Revalidate all common paths
    revalidatePath("/");
    revalidatePath("/api");
    revalidatePath("/dashboard");
    revalidatePath("/resources");
    revalidatePath("/coaching");
    revalidatePath("/subscription");

    console.log("All caches invalidated");
    return { success: true, message: "All caches invalidated" };
  } catch (error) {
    console.error("Failed to invalidate all caches:", error);
    return { success: false, error: "Failed to invalidate all caches" };
  }
}

/**
 * Force revalidation for a specific path
 */
export async function revalidatePathCache(path: string) {
  try {
    revalidatePath(path);
    console.log(`Path cache invalidated: ${path}`);
    return { success: true, message: `Path cache invalidated: ${path}` };
  } catch (error) {
    console.error(`Failed to invalidate path cache for ${path}:`, error);
    return {
      success: false,
      error: `Failed to invalidate path cache for ${path}`,
    };
  }
}
