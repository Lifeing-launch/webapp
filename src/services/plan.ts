import { SubscriptionPlan } from "@/typing/strapi";
import { strapiFetch } from "@/utils/fetch";
import { getStrapiBaseUrl } from "@/utils/urls";
import qs from "qs";

/**
 * Service for handling subscription plan operations
 */
export class PlanService {
  /**
   * Fetches a subscription plan from Strapi using the price ID.
   * The price ID can be either a monthly or yearly Stripe price ID.
   */
  static async fetchByPriceId(
    priceId: string
  ): Promise<SubscriptionPlan | null> {
    const queryObj = {
      populate: "*",
      filters: {
        $or: [
          { stripe_price_monthly_id: { $eq: priceId } },
          { stripe_price_yearly_id: { $eq: priceId } },
          { stripe_price_history: { stripe_price_id: { $eq: priceId } } },
        ],
      },
    };

    const strapiQuery = qs.stringify(queryObj, { encodeValuesOnly: true });
    const strapiUrl = `${getStrapiBaseUrl()}/subscription-plans?${strapiQuery}`;

    try {
      const response = await strapiFetch(strapiUrl);
      const plans = response?.data;

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

  /**
   * Determines if a plan needs to be updated based on current subscription data
   */
  static shouldUpdatePlan(
    currentPriceId: string,
    billingInterval: string,
    plan: SubscriptionPlan
  ): boolean {
    if (billingInterval === "month") {
      return currentPriceId !== plan.stripe_price_monthly_id;
    }
    if (billingInterval === "year") {
      return currentPriceId !== plan.stripe_price_yearly_id;
    }
    return false;
  }

  /**
   * Gets the appropriate price ID for a billing interval
   */
  static getPriceIdForInterval(
    plan: SubscriptionPlan,
    billingInterval: string
  ): string | null {
    if (billingInterval === "month") {
      return plan.stripe_price_monthly_id;
    }
    if (billingInterval === "year") {
      return plan.stripe_price_yearly_id;
    }
    return null;
  }

  /**
   * Checks if a plan is retired
   */
  static isPlanRetired(plan: SubscriptionPlan): boolean {
    return plan.plan_status === "RETIRED";
  }
}
