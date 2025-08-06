"use client";

import React, { useEffect, useState } from "react";
import {
  PlanCard,
  SUBSCRIPTION_INTERVAL_LABELS,
  SUBSCRIPTION_INTERVALS,
} from "../subscription/plan-card";
import { SubscriptionPlan } from "@/typing/strapi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { SubscriptionRecord } from "@/typing/supabase";
import { Skeleton } from "../ui/skeleton";

interface IPlans {
  currentSubscription?: SubscriptionRecord;
}

const Plans = ({ currentSubscription }: IPlans) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`/api/payment/plans`);
        if (!response.ok) {
          throw new Error("Failed to fetch plans");
        }
        const data: { data?: SubscriptionPlan[] } = await response.json();
        setPlans(data.data || []);
      } catch (err) {
        console.error(`Failed to display plans`, err);
        setError("Failed to load plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !plans.length) {
    return <p className="text-center">No plans found</p>;
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
            {plans.map((plan) => (
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
};

export default Plans;
