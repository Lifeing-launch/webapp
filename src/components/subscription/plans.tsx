import React from "react";
import {
  PlanCard,
  SUBSCRIPTION_INTERVAL_LABELS,
  SUBSCRIPTION_INTERVALS,
} from "../subscription/plan-card";
import { SubscriptionPlan } from "@/typing/strapi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { serverFetch } from "@/utils/fetch";
import { Database } from "@/typing/supabase";

interface IPlans {
  currentSubscription?: Database["public"]["Tables"]["subscriptions"]["Row"];
}

const Plans = async ({ currentSubscription }: IPlans) => {
  try {
    const data: { data?: SubscriptionPlan[] } =
      await serverFetch(`/api/payment/plans`);

    const plans = data.data;

    if (!plans?.length) {
      return <p className="text-center"> No plans found </p>;
    }

    return (
      <Tabs defaultValue={SUBSCRIPTION_INTERVALS[0]}>
        <div className="flex justify-center">
          <TabsList>
            {SUBSCRIPTION_INTERVALS.map((interval) => (
              <TabsTrigger value={interval} key={"trigger-" + interval}>
                {SUBSCRIPTION_INTERVAL_LABELS[interval]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {SUBSCRIPTION_INTERVALS.map((interval) => (
          <TabsContent value={interval} key={"content-" + interval}>
            <div className="grid gap-4 md:grid-cols-3">
              {plans?.map((plan) => (
                <PlanCard
                  plan={plan}
                  interval={interval}
                  key={plan.id}
                  currentSubscription={currentSubscription}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    );
  } catch (error) {
    console.error(`Failed to display plans`, error);
    return <p className="text-center"> No plans found </p>;
  }
};

export default Plans;
