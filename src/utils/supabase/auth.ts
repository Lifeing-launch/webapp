import { NextRequest } from "next/server";
import { createClient } from "./server";
import { profileService } from "@/services/forum";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Get authenticated user from middleware headers (preferred for API routes)
 * This avoids redundant Supabase calls since middleware already validated the user
 */
export function getAuthenticatedUser(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const userEmail = request.headers.get("x-user-email");

  if (!userId || !userEmail) {
    throw new Error("Unauthenticated user");
  }

  return {
    id: userId,
    email: userEmail,
  };
}

export async function getSupabaseUser(supabaseClient: SupabaseClient) {
  const supabase = supabaseClient || (await createClient());

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message || "Unauthenticated user");
  }

  return user;
}

export async function validateEdgeFunctionAuthentication(request: NextRequest) {
  const apiKey = request.headers.get("Authorization");
  if (apiKey !== process.env.EDGE_FUNCTION_API_KEY) {
    throw new Error("Unauthenticated edge function");
  }
}

/**
 * Invalidate profile cache when auth state changes
 * Call this after logout, login, or any auth state change
 */
export function invalidateProfileCache(): void {
  profileService.clearAllCaches();
}
