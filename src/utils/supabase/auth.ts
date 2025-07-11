import { NextRequest } from "next/server";
import { createClient } from "./server";
import { profileService } from "@/services/forum";

export async function checkUserIsAuthenticated() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthenticated user");
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
