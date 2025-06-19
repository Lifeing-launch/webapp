import { checkUserIsAuthenticated } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { buildSubscriptionRecord } from "../webhook/helpers";

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
    const { subscriptionId, newPriceId } = await request.json();

    // Look up the subscription item ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const itemId = subscription.items.data[0].id;

    // Update the subscription to the new price
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: "create_prorations",
    });

    console.log("Updated!!", JSON.stringify(updated));

    const supabase = await createClient();
    const record = await buildSubscriptionRecord(updated);

    await supabase
      .from("subscriptions")
      .update(record)
      .eq("stripe_subscription_id", subscriptionId)
      .single()
      .throwOnError();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error changing subscription:", err);
    return NextResponse.json(
      { error: "Error changing subscription" },
      { status: 500 }
    );
  }
}
