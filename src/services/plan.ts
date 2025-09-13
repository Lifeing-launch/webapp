import {
  MeetingType,
  SubscriptionPlan,
  SubscriptionPlanSlug,
} from "@/typing/strapi";
import { SubscriptionRecord } from "@/typing/supabase";
import { strapiFetch } from "@/utils/fetch";
import { getStrapiBaseUrl } from "@/utils/urls";
import qs from "qs";

const PLAN_PROTECTED_PAGES_TO_PLANS: Record<
  string,
  Set<SubscriptionPlanSlug>
> = {
  "/mindful-moderation": new Set(["elevate", "benefactor"]),
};

const PLAN_PROTECTED_PAGES = Object.keys(PLAN_PROTECTED_PAGES_TO_PLANS);

const PROTECTED_MEETING_TYPES = new Set<MeetingType>(["mindful-moderation"]);

const PLANS_TO_PROTECTED_MEETING_TYPE: Record<
  SubscriptionPlanSlug,
  Set<MeetingType>
> = {
  insight: new Set([]),
  elevate: new Set(["mindful-moderation"]),
  benefactor: new Set(["mindful-moderation"]),
};

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
      console.error("Error fetching plan by price ID:", priceId, err);
      return null;
    }
  }

  static async getPlanSlugFromId(
    planId: number
  ): Promise<SubscriptionPlanSlug | null> {
    const queryObj = { filters: { id: { $eq: planId } } };

    const strapiQuery = qs.stringify(queryObj, { encodeValuesOnly: true });
    const strapiUrl = `${getStrapiBaseUrl()}/subscription-plans?${strapiQuery}`;

    try {
      const response = await strapiFetch(strapiUrl);
      const plans = response?.data;

      if (plans && plans.length === 1) {
        return plans[0]?.slug;
      }

      console.warn(
        "No plan found or multiple plans returned for plan ID:",
        planId
      );
      return null;
    } catch (err) {
      console.error("Error fetching plan by plan ID:", planId, err);
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

  static isSubscriptionProtectedPage(path: string): boolean {
    return PLAN_PROTECTED_PAGES.some((page) => path.startsWith(page));
  }

  static isWhitelistedSubscription(
    subscription?: Partial<SubscriptionRecord> | null
  ) {
    return (
      subscription?.stripe_subscription_id?.startsWith("whitelist_") ||
      subscription?.stripe_subscription_id?.startsWith("internal_")
    );
  }

  static async canAccessPlanProtectedPage(
    path: string,
    subscription?: Partial<SubscriptionRecord> | null
  ): Promise<boolean> {
    if (this.isWhitelistedSubscription(subscription)) return true;

    const planId = subscription?.plan_id;
    if (!planId) return false;

    const matched = PLAN_PROTECTED_PAGES.find((page) => path.startsWith(page));

    if (!matched) return true;

    // TODO: Maintain a cache of planSlug to planId
    const planSlug = await this.getPlanSlugFromId(planId);

    if (!planSlug) return false;

    const plans = PLAN_PROTECTED_PAGES_TO_PLANS[matched];
    return plans.has(planSlug);
  }

  static async getMeetingTypeExclusionsFromPlan(
    subscription?: Partial<SubscriptionRecord> | null
  ): Promise<MeetingType[]> {
    if (this.isWhitelistedSubscription(subscription)) return [];

    const planId = subscription?.plan_id;
    if (!planId) return Array.from(PROTECTED_MEETING_TYPES);

    const planSlug = await this.getPlanSlugFromId(planId);
    if (!planSlug) return Array.from(PROTECTED_MEETING_TYPES);

    const excludedMeetingTypes = PROTECTED_MEETING_TYPES.difference(
      PLANS_TO_PROTECTED_MEETING_TYPE[planSlug] || new Set()
    );

    return Array.from(excludedMeetingTypes);
  }
}
