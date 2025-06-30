import { NextRequest } from "next/server";
import { createClient } from "./server";

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
