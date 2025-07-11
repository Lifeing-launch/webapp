/**
 * This endpoint fetches plans that have been marked as retired in Strapi
 * and updates the corresponding records in Supabase to reflect their
 * retired status. It ensures that Supabase remains in sync with Strapi
 * by flagging any plans that are no longer active.
 */

import { SubscriptionService } from "@/services/subscription";
import { SubscriptionPlan } from "@/typing/strapi";
import { strapiFetch } from "@/utils/fetch";
import { validateEdgeFunctionAuthentication } from "@/utils/supabase/auth";
import { createAdminClient } from "@/utils/supabase/server";
import { getStrapiBaseUrl } from "@/utils/urls";
import { NextRequest, NextResponse } from "next/server";
import qs from "qs";

const PLANS_PER_REQUEST = 10;

export async function POST(request: NextRequest) {
  try {
    await validateEdgeFunctionAuthentication(request);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = await createAdminClient();

    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() + 24); // Add 24 hours to the current time

    console.log(`Fetching all non-canceled subscriptions before ${cutoffDate}`);
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("*")
      .neq("status", "canceled")
      .lte("current_period_end", cutoffDate.toISOString())
      .throwOnError();

    const plans = await getStrapiPlans();

    let cancelledCount = 0;
    for (const s of subs) {
      if (plans[s.plan_id] === "RETIRED") {
        console.log(
          `Plan:${s.plan_id} has been retired.`,
          `Canceling the subscription '${s.stripe_subscription_id}' within stripe.`
        );

        await SubscriptionService.cancelSubscriptionAtPeriodEnd(
          s.stripe_subscription_id
        );

        console.log(
          `Subscription: ${s.stripe_subscription_id} canceled within stripe.`,
          `Updating the database to reflect new status`
        );

        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("id", s.id)
          .throwOnError();

        cancelledCount++;
      }
    }

    return NextResponse.json({
      success: true,
      total: subs.length,
      cancelled: cancelledCount,
    });
  } catch (err) {
    console.error("Error cleaning up retired plans:", err);
    return NextResponse.json(
      { error: "Error cleaning up retired plans" },
      { status: 500 }
    );
  }
}

async function getStrapiPlans() {
  console.log(`Fetching all strapi plans`);

  const plans: Record<string, string> = {};
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    // TODO: Type this correctly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const strapiQueryObj: any = {
      pagination: {
        pageSize: PLANS_PER_REQUEST,
        page,
      },
    };

    const strapiQuery = qs.stringify(strapiQueryObj, {
      encodeValuesOnly: true,
    });
    const strapiUrl = `${getStrapiBaseUrl()}/subscription-plans?${strapiQuery}`;
    const data = await strapiFetch(strapiUrl);
    const pagination = data.meta.pagination;

    data.data.forEach((plan: SubscriptionPlan) => {
      plans[plan.id] = plan.plan_status;
    });

    // Update pagination data for next page
    page++;
    totalPages = pagination.pageCount;
  }

  return plans;
}
