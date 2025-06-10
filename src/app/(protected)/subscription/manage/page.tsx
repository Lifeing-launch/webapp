import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import CurrentPlanCard from "@/components/subscription/current-plan-card";
import { CreditCard } from "lucide-react";
import React from "react";
import { PlanCard } from "@/components/subscription/plan-card";
import { plans } from "@/utils/constants";

const breadcrumbs: Breadcrumb[] = [
  { label: "Profile", href: "/profile" },
  { label: "Manage Subscription" },
];

const ManagePlansPage = () => {
  return (
    <PageTemplate
      breadcrumbs={breadcrumbs}
      headerIcon={<CreditCard />}
      title="Manage Subscription"
    >
      <CurrentPlanCard
        subscription={{
          ...plans[1],
          billingCycle: "monthly",
          cardLastDigits: 1234,
          cardType: "Visa",
          nextPaymentDue: new Date(),
        }}
      />
      <section className="my-4">
        <h2 className="text-lg mb-2"> Upgrade your plan </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard plan={plan} key={plan.id} />
          ))}
        </div>
      </section>
    </PageTemplate>
  );
};

export default ManagePlansPage;
