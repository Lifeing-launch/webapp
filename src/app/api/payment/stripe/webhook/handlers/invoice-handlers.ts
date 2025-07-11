import {
  getSupabaseAdmin,
  executeSupabaseQuery,
  createEventContext,
  logWebhookEvent,
} from "../helpers";
import { SubscriptionService } from "@/services/subscription";
import { PlanService } from "@/services/plan";
import Stripe from "stripe";

/**
 * Handles invoice payment succeeded events
 */
export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
): Promise<void> {
  const subId = SubscriptionService.getSubscriptionIdFromInvoice(invoice);
  if (!subId) {
    console.warn("No subscription ID found in invoice");
    return;
  }

  const context = createEventContext(
    "handleInvoicePaymentSucceeded",
    `invoice_id: ${invoice.id} and subscription_id: ${subId}`
  );
  logWebhookEvent(context, true);

  try {
    const line = invoice.lines.data[0];
    const { start, end } = line.period;

    await executeSupabaseQuery(
      getSupabaseAdmin()
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: new Date(start * 1000).toISOString(),
          current_period_end: new Date(end * 1000).toISOString(),
          failed_at: null, // clear any previous failure
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subId),
      context
    );

    logWebhookEvent(context, false);
  } catch (error) {
    console.error("Error handling invoice payment succeeded:", error);
    throw error;
  }
}

/**
 * Handles invoice payment failed events
 */
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  const subId = SubscriptionService.getSubscriptionIdFromInvoice(invoice);
  if (!subId) {
    console.warn("No subscription ID found in invoice");
    return;
  }

  const context = createEventContext(
    "handleInvoicePaymentFailed",
    `invoice_id: ${invoice.id} and subscription_id: ${subId}`
  );
  logWebhookEvent(context, true);

  try {
    // Fetch current failed_at
    const data = await executeSupabaseQuery<{ failed_at?: Date }>(
      getSupabaseAdmin()
        .from("subscriptions")
        .select("failed_at")
        .eq("stripe_subscription_id", subId),
      context,
      "fetching current failed_at"
    );

    const now = new Date().toISOString();

    // If this is the first failure, set failed_at
    if (!data?.failed_at) {
      await executeSupabaseQuery(
        getSupabaseAdmin()
          .from("subscriptions")
          .update({ failed_at: now, updated_at: now })
          .eq("stripe_subscription_id", subId),
        context,
        "setting failed_at"
      );
    }

    logWebhookEvent(context, false);
  } catch (error) {
    console.error("Error handling invoice payment failed:", error);
    throw error;
  }
}

/**
 * Handles invoice upcoming events
 */
export async function handleInvoiceUpcoming(
  invoice: Stripe.Invoice
): Promise<void> {
  const subId = SubscriptionService.getSubscriptionIdFromInvoice(invoice);
  if (!subId) {
    console.warn("No subscription ID found in invoice");
    return;
  }

  const context = createEventContext(
    "handleInvoiceUpcoming",
    `invoice_id: ${invoice.id} and subscription_id: ${subId}`
  );
  logWebhookEvent(context, true);

  try {
    const subscriptionItem =
      await SubscriptionService.fetchSubscriptionItem(subId);
    const price = subscriptionItem?.price;

    if (!price) {
      throw new Error("No price found in subscription item");
    }

    const plan = await PlanService.fetchByPriceId(price.id);
    if (!plan) {
      throw new Error("No plan found for price ID");
    }

    // Get current subscription data
    const data = await executeSupabaseQuery<{
      stripe_price_id: string;
      billing_interval: "month" | "year";
    }>(
      getSupabaseAdmin()
        .from("subscriptions")
        .select("stripe_price_id, billing_interval")
        .eq("stripe_subscription_id", subId)
        .single(),
      context,
      "fetching current stripe_price_id"
    );

    // Check if price needs to be updated
    if (
      data &&
      PlanService.shouldUpdatePlan(
        data.stripe_price_id,
        data.billing_interval,
        plan
      )
    ) {
      console.log(`Price for ${subId} has changed. Attempting to update`);
      const newPriceId = PlanService.getPriceIdForInterval(
        plan,
        data.billing_interval
      );
      if (newPriceId) {
        console.log(`Updating price for ${subId} to ${newPriceId}`);
        await SubscriptionService.updateSubscriptionPrice(
          subId,
          subscriptionItem.id,
          newPriceId
        );
      }
    }

    // Check if plan is retired
    if (PlanService.isPlanRetired(plan)) {
      console.log(`Plan for ${subId} is retired. Canceling`);
      await SubscriptionService.cancelSubscriptionAtPeriodEnd(subId);
    }

    logWebhookEvent(context, false);
  } catch (error) {
    console.error("Error handling invoice upcoming:", error);
    throw error;
  }
}
