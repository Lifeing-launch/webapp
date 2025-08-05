"use client";

import { useSubscription } from "@/components/providers/subscription-provider";
import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import { CreditCard } from "lucide-react";
import CancelSubscription from "@/components/subscription/cancel";
import { formatDate } from "@/utils/datetime";
import { Skeleton } from "@/components/ui/skeleton";

const breadcrumbs: Breadcrumb[] = [
  { label: "Profile", href: "/profile" },
  { label: "Cancel Subscription" },
];

export default function CancelSubscriptionPage() {
  const { subscription, loading, error } = useSubscription();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full max-w-lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500">Error loading subscription: {error}</p>
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

    if (subscription.cancel_at) {
      return (
        <div className="max-w-lg flex flex-col gap-5">
          <p className="text-sm">
            Your subscription is already scheduled to end at{" "}
            {formatDate(new Date(subscription.cancel_at))}.
          </p>
        </div>
      );
    }

    return <CancelSubscription currentSubscription={subscription} />;
  };

  return (
    <PageTemplate
      breadcrumbs={breadcrumbs}
      headerIcon={<CreditCard />}
      title="Cancel Subscription"
    >
      {renderContent()}
    </PageTemplate>
  );
}
