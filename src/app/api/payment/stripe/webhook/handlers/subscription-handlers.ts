import {
  getSupabaseAdmin,
  executeSupabaseQuery,
  createEventContext,
  logWebhookEvent,
} from "../helpers";
import { SubscriptionService } from "../../../../../../services/subscription";
import { unixTimestampToISO } from "../helpers";
import Stripe from "stripe";

/**
 * Handles subscription creation events
 */
export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<void> {
  const context = createEventContext(
    "handleSubscriptionCreated",
    `subscription_id: ${subscription.id}`
  );
  logWebhookEvent(context, true);

  try {
    const record =
      await SubscriptionService.buildSubscriptionRecord(subscription);
    if (!record) {
      throw new Error("Failed to build subscription record");
    }

    await executeSupabaseQuery(
      getSupabaseAdmin().from("subscriptions").insert(record),
      context
    );

    logWebhookEvent(context, false);
  } catch (error) {
    console.error("Error handling subscription created:", error);
    throw error;
  }
}

/**
 * Handles subscription update events
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const context = createEventContext(
    "handleSubscriptionUpdated",
    `subscription_id: ${subscription.id}`
  );
  logWebhookEvent(context, true);

  try {
    const record =
      await SubscriptionService.buildSubscriptionRecord(subscription);
    if (!record) {
      throw new Error("Failed to build subscription record");
    }

    await executeSupabaseQuery(
      getSupabaseAdmin()
        .from("subscriptions")
        .update(record)
        .eq("stripe_subscription_id", subscription.id),
      context
    );

    logWebhookEvent(context, false);
  } catch (error) {
    console.error("Error handling subscription updated:", error);
    throw error;
  }
}

/**
 * Handles subscription deletion events
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const context = createEventContext(
    "handleSubscriptionDeleted",
    `subscription_id: ${subscription.id}`
  );
  logWebhookEvent(context, true);

  try {
    const now = new Date().toISOString();
    const canceledAt = subscription.canceled_at
      ? unixTimestampToISO(subscription.canceled_at)
      : now;

    await executeSupabaseQuery(
      getSupabaseAdmin()
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: canceledAt,
          updated_at: now,
        })
        .eq("stripe_subscription_id", subscription.id),
      context
    );

    logWebhookEvent(context, false);
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
    throw error;
  }
}
