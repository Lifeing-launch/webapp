import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { SubscriptionService } from "@/services/subscription";

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, newPriceId } = await request.json();

    // Look up the subscription item ID
    const itemId = (
      await SubscriptionService.fetchSubscriptionItem(subscriptionId)
    ).id;

    // Update the subscription to the new price
    const updated = await SubscriptionService.updateSubscriptionPrice(
      subscriptionId,
      itemId,
      newPriceId
    );

    const supabase = await createClient();
    const record = await SubscriptionService.buildSubscriptionRecord(updated);

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
