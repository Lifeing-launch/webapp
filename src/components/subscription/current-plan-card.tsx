import React from "react";
import { Card, CardContent } from "../ui/card";
import { CalendarClock, CalendarRange, CreditCard } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/datetime";
import { SubscriptionPlan } from "@/typing/strapi";
import { Badge } from "../ui/badge";
import { capitalizeFirstLetter } from "@/utils/format";
import { SubscriptionRecord } from "@/typing/supabase";
import {
  SUBSCRIPTION_INTERVAL_LABELS,
  SubscriptionInterval,
} from "./plan-card";

interface ICurrentPlanCard {
  subscription: SubscriptionRecord;
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
      Icon: CreditCard,
      value: `${capitalizeFirstLetter(subscription.card_type || "")} ending in ${subscription.card_last4}`,
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

  const isSubscriptionCancelled = !!subscription.cancel_at;

  if (!isSubscriptionCancelled) {
    stats.push({
      label: "Next Payment Due:",
      Icon: CalendarClock,
      value: formatDate(new Date(subscription.current_period_end)),
    });
  }

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
        <div className="text-sm flex flex-col gap-4 md:flex-row md:items-center md:gap-2">
          {stats.map((stat) => (
            <dl
              key={stat.label}
              className="flex flex-1 gap-2 border-slate-200 border-r last:border-0 first:pl-0  md:pl-4 "
            >
              <div>{<stat.Icon className="size-5" />}</div>
              <div className="flex-1">
                <dt>{stat.label}</dt>
                <dd className="font-semibold">{stat.value}</dd>
              </div>
            </dl>
          ))}

          <div className="flex-1 h-full text-red-700 font-medium text-center">
            {subscription.cancel_at ? (
              <>
                Subsciption ends{" "}
                {formatDate(new Date(subscription.cancel_at))}{" "}
              </>
            ) : (
              <Link href="/subscription/cancel">Cancel subscription</Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentPlanCard;
