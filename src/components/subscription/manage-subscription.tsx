"use client";

import { useSubscription } from "@/components/providers/subscription-provider";
import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import CurrentPlanCard from "@/components/subscription/current-plan-card";
import { CreditCard } from "lucide-react";
import Plans from "@/components/subscription/plans";
import { SubscriptionPlan } from "@/typing/strapi";
import { formatDate } from "@/utils/datetime";
import { IBanner } from "@/components/ui/custom/banner";
import { PlanService } from "@/services/plan";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

const breadcrumbs: Breadcrumb[] = [
  { label: "Profile", href: "/profile" },
  { label: "Manage Subscription" },
];

export default function ManageSubscription() {
  const { subscription, loading, error } = useSubscription();
  const {
    data: plan,
    isLoading: planLoading,
    error: planError,
  } = useQuery({
    queryKey: ["subscription-plan", subscription?.plan_id],
    queryFn: async () => {
      if (!subscription?.plan_id) return null;

      const response = await fetch(
        `/api/payment/plans/${subscription.plan_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch plan");
      }

      const data: { data?: SubscriptionPlan[] } = await response.json();
      return data.data?.[0] || null;
    },
    enabled: !!subscription?.plan_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getBannerProps = (): IBanner | undefined => {
    if (!subscription || !plan) return undefined;

    if (subscription.failed_at) {
      return {
        type: "warning",
        message: `You have a failed payment. Your membership will be cancelled after 3 attempts.`,
      };
    }

    if (PlanService.isPlanRetired(plan)) {
      return {
        type: "error",
        message: `Your subscription plan has been retired. Please choose a new plan before ${formatDate(new Date(subscription.current_period_end))} to continue your membership.`,
      };
    }

    if (
      PlanService.shouldUpdatePlan(
        subscription.stripe_price_id,
        subscription.billing_interval,
        plan
      )
    ) {
      return {
        message: `Your subscription rate has changed from $${subscription.amount}. You will be charged the new amount from the next billing cycle.`,
      };
    }
  };

  const renderContent = () => {
    if (loading || planLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    if (error || planError) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500">
            Error loading subscription: {error || planError?.message}
          </p>
        </div>
      );
    }

    if (!subscription) {
      return (
        <div className="text-center py-8">
          <p>No active subscription found.</p>
        </div>
      );
    }

    if (!plan) {
      return (
        <div className="text-center py-8">
          <p>Plan information not available.</p>
        </div>
      );
    }

    return (
      <>
        <CurrentPlanCard subscription={subscription} plan={plan} />
        <section className="my-4">
          <h2 className="text-lg mb-2">Upgrade your plan</h2>
          <Plans currentSubscription={subscription} />
        </section>
      </>
    );
  };

  return (
    <PageTemplate
      breadcrumbs={breadcrumbs}
      headerIcon={<CreditCard />}
      title="Manage Subscription"
      bannerProps={getBannerProps()}
    >
      {renderContent()}
    </PageTemplate>
  );
}
