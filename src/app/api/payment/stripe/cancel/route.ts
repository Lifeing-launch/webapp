import { SubscriptionService } from "@/services/subscription";
import { checkUserIsAuthenticated } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await checkUserIsAuthenticated();
  } catch {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { subscriptionId, reason } = await request.json();

    const supabase = await createClient();
    // 1) Fetch current cancellation state
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("cancel_at")
      .eq("stripe_subscription_id", subscriptionId)
      .single()
      .throwOnError();

    if (existing.cancel_at) {
      throw new Error("Subscription is already set to cancel at period end.");
    }

    await SubscriptionService.cancelSubscriptionAtPeriodEnd(subscriptionId);

    // Persist in Supabase: mark cancel_at + reason
    const now = new Date().toISOString();
    await supabase
      .from("subscriptions")
      .update({
        cancel_at: now,
        updated_at: now,
        cancel_reason: reason,
      })
      .eq("stripe_subscription_id", subscriptionId)
      .single()
      .throwOnError();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error canceling subscription:", err);
    return NextResponse.json(
      { error: "Error canceling subscription" },
      { status: 500 }
    );
  }
}
