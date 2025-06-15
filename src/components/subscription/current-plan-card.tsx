import React from "react";
import { Card, CardContent } from "../ui/card";
import { CalendarRange } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/datetime";
import { SubscriptionPlan } from "@/typing/strapi";
import { Badge } from "../ui/badge";
import { capitalizeFirstLetter } from "@/utils/format";
import { Database } from "@/typing/supabase";
import {
  SUBSCRIPTION_INTERVAL_LABELS,
  SubscriptionInterval,
} from "./plan-card";

interface ICurrentPlanCard {
  subscription: Database["public"]["Tables"]["subscriptions"]["Row"];
  plan: SubscriptionPlan;
}

const CurrentPlanCard = async ({ subscription, plan }: ICurrentPlanCard) => {
  const stats = [
    {
      label: "Billing Cycle",
      Icon: CalendarRange,
      value:
        SUBSCRIPTION_INTERVAL_LABELS[
          subscription.billing_interval as SubscriptionInterval
        ],
    },
    {
      label: "Payment Method",
      Icon: CalendarRange,
      value: `${capitalizeFirstLetter(subscription.card_type || "")} ending in ${subscription.card_last4}`,
    },
    {
      label: "Next Payment Due:",
      Icon: CalendarRange,
      value: formatDate(new Date(subscription.current_period_end)),
    },
  ];

  const getDisplayPrice = () => {
    switch (subscription.billing_interval) {
      case "month":
        return `$${plan.price_monthly}/month`;
      case "year":
        return `$${plan.price_yearly}/year`;
    }
  };

  const isFreeTrial =
    subscription.status === "trialing" ||
    (subscription?.trial_end && new Date() < new Date(subscription?.trial_end));

  return (
    <Card>
      <CardContent className="gap-4 flex flex-col">
        <div>
          <p className="text-xs text-primary"> Current plan </p>
          <h2 className="font-medium">
            {" "}
            {plan.name}
            {isFreeTrial && <Badge className="ml-1"> Free Trial </Badge>}
          </h2>
          <p className="text-2xl font-semibold"> {getDisplayPrice()} </p>
        </div>
        <div className="flex text-sm items-center gap-2">
          {stats.map((stat) => (
            <dl
              key={stat.label}
              className="flex flex-1 gap-2 border-slate-200 border-r last:border-0 pl-4 first:pl-0"
            >
              <div>{<stat.Icon className="size-5" />}</div>
              <div className="flex-1">
                <dt>{stat.label}</dt>
                <dd className="font-semibold">{stat.value}</dd>
              </div>
            </dl>
          ))}

          <div className="flex-1 h-full text-red-700 font-medium text-center">
            <Link href="/subscription/cancel">Cancel subscription</Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentPlanCard;
