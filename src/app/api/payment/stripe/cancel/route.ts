import { checkUserIsAuthenticated } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-05-28.basil",
});

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

    // Tell Stripe to cancel at period end
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

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
