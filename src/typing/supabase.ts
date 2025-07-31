import { Database } from "./generated/supabase";

export type SubscriptionRecord =
  Database["public"]["Tables"]["subscriptions"]["Row"];

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
