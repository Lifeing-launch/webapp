import { Database } from "./generated/supabase";

export type SubscriptionRecord =
  Database["public"]["Tables"]["subscriptions"]["Row"];
