import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import { CreditCard } from "lucide-react";
import React from "react";

import CancelSubscription from "@/components/subscription/cancel";
import { createClient } from "@/utils/supabase/server";
import { formatDate } from "@/utils/datetime";

const breadcrumbs: Breadcrumb[] = [
  { label: "Profile", href: "/profile" },
  { label: "Cancel Subscription" },
];

const CancelPlansPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthenticated");

  const { data: subscription } = await supabase
    .from("active_subscriptions")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  if (!subscription) throw new Error("Subscription not found for user");

  return (
    <PageTemplate
      breadcrumbs={breadcrumbs}
      headerIcon={<CreditCard />}
      title="Cancel Subscription"
    >
      {subscription?.cancel_at ? (
        <div className="max-w-lg flex flex-col gap-5">
          <p className="text-sm">
            Your subscription is already scheduled to end at{" "}
            {formatDate(new Date(subscription?.cancel_at))}.
          </p>
        </div>
      ) : (
        <CancelSubscription currentSubscription={subscription} />
      )}
    </PageTemplate>
  );
};

export default CancelPlansPage;
