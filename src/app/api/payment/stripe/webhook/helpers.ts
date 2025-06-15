import { SubscriptionPlan } from "@/typing/strapi";
import { strapiFetch } from "@/utils/fetch";
import qs from "qs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-05-28.basil",
});

/**
 * Builds a subscription record for storing in the database.
 * This function processes the Stripe subscription object and extracts
 * relevant details to create a structured record for storage.
 *
 * @param subscription - The Stripe subscription object containing details about the subscription.
 * @param plan - The subscription plan fetched from Strapi, containing metadata and features.
 * @returns An object representing the subscription record, ready to be saved in the database.
 *
 * Example usage:
 * ```typescript
 * const record = buildSubscriptionRecord(stripeSubscription, strapiPlan);
 * await saveSubscriptionToDatabase(record);
 * ```
 */
export async function buildSubscriptionRecord(
  subscription: Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  }
) {
  const price = subscription.items.data[0]?.price;
  const plan = await fetchPlanByPriceId(price.id);
  if (!plan) {
    console.error("No matching plan found for price ID:", price.id);
    return;
  }

  const card = await getCardDetails(subscription);
  const record = {
    user_id: subscription.metadata.userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    plan_id: plan.id,
    status: subscription.status, // usually 'trialing' or 'active'
    billing_interval: price.recurring?.interval, // 'month' or 'year'

    card_last4: card?.last4,
    card_type: card?.brand,

    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    cancel_at: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null,

    // Handle current_period_start/current_period_end not existing on change subscription event
    // See /api/payment/stripe/change
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,

    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,

    updated_at: new Date().toISOString(),
  };

  console.log("Record to store in Supabase", JSON.stringify(record));
  return record;
}

/**
 * Fetches a subscription plan from Strapi using the price ID.
 * The price ID can be either a monthly or yearly Stripe price ID.
 * @param priceId - The Stripe price ID (monthly or yearly).
 * @returns The subscription plan matching the price ID, or null if not found.
 */
export async function fetchPlanByPriceId(
  priceId: string
): Promise<SubscriptionPlan | null> {
  const queryObj = {
    filters: {
      $or: [
        { stripe_price_monthly_id: { $eq: priceId } },
        { stripe_price_yearly_id: { $eq: priceId } },
      ],
    },
  };

  const strapiQuery = qs.stringify(queryObj, { encodeValuesOnly: true });
  const strapiUrl = `${process.env.STRAPI_BASE_URL}/subscription-plans?${strapiQuery}`;

  try {
    const response = await strapiFetch(strapiUrl);
    const plans = response?.data;

    // Ensure only one plan is returned.
    if (plans && plans.length === 1) {
      return plans[0];
    }

    console.warn(
      "No plan found or multiple plans returned for price ID:",
      priceId
    );
    return null;
  } catch (err) {
    console.error("Error fetching plan by price ID:", err);
    return null;
  }
}

export function stripeHandlerLogger(
  event: string,
  suffix: string,
  start = true
) {
  if (start) {
    console.log(`Started ${event} for ${suffix}`);
  } else {
    console.log(`Completed ${event}  for ${suffix}`);
  }
}

export async function supabaseQueryWrapper<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  eventName: string,
  suffix = ""
): Promise<T | null> {
  try {
    const { data } = await query.throwOnError();
    return data;
  } catch (error) {
    const errorMsg = `Supabase error: ${eventName}-${suffix}:`;
    console.error(errorMsg, error);
    throw new Error(errorMsg);
  }
}

async function getCardDetails(subscription: Stripe.Subscription) {
  let pm = subscription.default_payment_method;

  if (!pm) {
    console.warn("No default payment method on subscription.");
    return null;
  }

  // If it’s just an ID, fetch the full PaymentMethod object
  if (typeof pm === "string") {
    pm = await stripe.paymentMethods.retrieve(pm);
  }

  // At this point `pm` is a Stripe.PaymentMethod
  const card = (pm as Stripe.PaymentMethod).card;
  if (!card) {
    console.warn("Default payment method isn’t a card.");
    return null;
  }

  return { brand: card.brand, last4: card.last4 };
}
