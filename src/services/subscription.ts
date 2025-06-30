import { PlanService } from "./plan";
import { unixTimestampToISO } from "../app/api/payment/stripe/webhook/helpers";
import Stripe from "stripe";
import { SubscriptionRecord } from "@/typing/supabase";

export const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY as string,
  {
    apiVersion: "2025-05-28.basil",
  }
);

/**
 * Service for handling subscription-related operations
 */
export class SubscriptionService {
  /**
   * Builds a subscription record for storing in the database.
   * This function processes the Stripe subscription object and extracts
   * relevant details to create a structured record for storage.
   */
  static async buildSubscriptionRecord(
    subscription: Stripe.Subscription
  ): Promise<Partial<SubscriptionRecord> | null> {
    const subscriptionItem = subscription.items.data[0];
    const price = subscriptionItem?.price;

    if (!price) {
      console.error("No price found in subscription item");
      return null;
    }

    const plan = await PlanService.fetchByPriceId(price.id);
    if (!plan) {
      console.error("No matching plan found for price ID:", price.id);
      return null;
    }

    const card = await this.getCardDetails(subscription);

    const record: Partial<SubscriptionRecord> = {
      user_id: subscription.metadata.userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      stripe_price_id: price.id,
      plan_id: plan.id,
      status: subscription.status,
      billing_interval: price.recurring?.interval || "",
      card_last4: card?.last4 || "",
      card_type: card?.brand || "",
      canceled_at: unixTimestampToISO(subscription.canceled_at),
      cancel_at: unixTimestampToISO(subscription.cancel_at),
      current_period_start: unixTimestampToISO(
        subscriptionItem.current_period_start
      ) as string,
      current_period_end: unixTimestampToISO(
        subscriptionItem.current_period_end
      ) as string,
      trial_start: unixTimestampToISO(subscription.trial_start),
      trial_end: unixTimestampToISO(subscription.trial_end),
      updated_at: new Date().toISOString(),
      amount: subscriptionItem.plan.amount
        ? subscriptionItem.plan.amount / 100
        : 0,
    };

    console.log("Record to store in Supabase", JSON.stringify(record));
    return record;
  }

  /**
   * Extracts card details from a subscription's payment method
   */
  private static async getCardDetails(subscription: Stripe.Subscription) {
    let pm = subscription.default_payment_method;

    if (!pm) {
      console.warn("No default payment method on subscription.");
      return null;
    }

    // If it's just an ID, fetch the full PaymentMethod object
    if (typeof pm === "string") {
      pm = await stripeClient.paymentMethods.retrieve(pm);
    }

    // At this point `pm` is a Stripe.PaymentMethod
    const card = (pm as Stripe.PaymentMethod).card;
    if (!card) {
      console.warn("Default payment method isn't a card.");
      return null;
    }

    return { brand: card.brand, last4: card.last4 };
  }

  /**
   * Gets the subscription ID from an invoice
   */
  static getSubscriptionIdFromInvoice(
    invoice: Stripe.Invoice
  ): string | undefined {
    const sub = invoice.parent?.subscription_details?.subscription;

    if (!sub) return undefined;

    if (typeof sub === "string") {
      return sub;
    }

    return sub.id;
  }

  /**
   * Updates a subscription's price in Stripe
   */
  static async updateSubscriptionPrice(
    subscriptionId: string,
    itemId: string,
    newPriceId: string
  ): Promise<Stripe.Subscription> {
    return await stripeClient.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: "create_prorations",
    });
  }

  /**
   * Cancels a subscription at period end
   */
  static async cancelSubscriptionAtPeriodEnd(
    subscriptionId: string
  ): Promise<void> {
    console.log("Canceling subscription", subscriptionId);
    await stripeClient.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /**
   * Fetch a subscription item
   */
  static async fetchSubscriptionItem(
    subscriptionId: string
  ): Promise<Stripe.SubscriptionItem> {
    const subscription =
      await stripeClient.subscriptions.retrieve(subscriptionId);
    return subscription.items.data[0];
  }
}
