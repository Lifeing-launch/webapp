import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import CurrentPlanCard from "@/components/subscription/current-plan-card";
import { CreditCard } from "lucide-react";
import React from "react";
import Plans from "@/components/subscription/plans";
import { SubscriptionPlan } from "@/typing/strapi";
import { serverFetch } from "@/utils/fetch";
import { createClient } from "@/utils/supabase/server";

const breadcrumbs: Breadcrumb[] = [
  { label: "Profile", href: "/profile" },
  { label: "Manage Subscription" },
];

const ManagePlansPage = async () => {
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

  const data: { data?: SubscriptionPlan[] } = await serverFetch(
    `/api/payment/plans/${subscription.plan_id}`
  );

  const plan = data.data?.[0];
  if (!plan) throw new Error("Plan not found for user");

  return (
    <PageTemplate
      breadcrumbs={breadcrumbs}
      headerIcon={<CreditCard />}
      title="Manage Subscription"
    >
      <CurrentPlanCard subscription={subscription} plan={plan} />
      <section className="my-4">
        <h2 className="text-lg mb-2"> Upgrade your plan </h2>
        <Plans currentSubscription={subscription} />
      </section>
    </PageTemplate>
  );
};

export default ManagePlansPage;
