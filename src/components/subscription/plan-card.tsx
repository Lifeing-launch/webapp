import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { CircleCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Link from "next/link";

import { SubscriptionPlan } from "@/typing/strapi";
import { serverFetch } from "@/utils/fetch";
import { Database } from "@/typing/supabase";

export type SubscriptionInterval = "month" | "year";
export const SUBSCRIPTION_INTERVALS: SubscriptionInterval[] = ["month", "year"];
export const SUBSCRIPTION_INTERVAL_LABELS: Record<
  SubscriptionInterval,
  string
> = {
  month: "Monthly",
  year: "Yearly",
};

interface IPlanCard {
  plan: SubscriptionPlan;
  interval: SubscriptionInterval;
  currentSubscription?: Database["public"]["Tables"]["subscriptions"]["Row"];
}

export const PlanCard = async ({
  plan,
  interval,
  currentSubscription,
}: IPlanCard) => {
  try {
    const { url }: { url?: string } = await serverFetch(
      `/api/payment/stripe/session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId:
            interval === "month"
              ? plan.stripe_price_monthly_id
              : plan.stripe_price_yearly_id,
          plan: plan.name,
          successPath: "/dashboard",
          cancelPath: "/plans",
        }),
      }
    );

    const matchesCurrentSubscription =
      currentSubscription?.plan_id === plan.id &&
      (currentSubscription.billing_interval === interval ||
        currentSubscription.billing_interval === "yearly");

    const disabled = !url || matchesCurrentSubscription;

    const getDisplayPrice = () => {
      switch (interval) {
        case "month":
          return `$${plan.price_monthly}/month`;
        case "year":
          return `$${plan.price_yearly}/year`;
      }
    };

    const getButtonLabel = () => {
      if (matchesCurrentSubscription) {
        return "Current Plan";
      } else if (currentSubscription) {
        return "Change Plan";
      } else {
        return "Continue";
      }
    };

    return (
      <Card
        className={cn(
          plan.is_most_popular && "bg-lime-100",
          matchesCurrentSubscription && "bg-gray-50"
        )}
      >
        <CardContent className={"flex flex-col gap-9 h-full"}>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h1 className="font-medium">{plan.name}</h1>
              {plan.is_most_popular && <Badge> Most popular</Badge>}
            </div>
            <h2 className="text-2xl font-semibold">{getDisplayPrice()}</h2>
          </div>

          <ul className="flex flex-col gap-2 flex-1 text-sm text-zinc-700 mb-5">
            {plan?.features.map((feature, index) => (
              <li key={index} className="flex gap-2">
                <CircleCheck size={20} className="mt-[2]" />
                <span className="flex-1">{feature.label}</span>
              </li>
            ))}
          </ul>

          {disabled ? (
            <Button disabled>{getButtonLabel()}</Button>
          ) : (
            <Button asChild>
              <Link href={url || ""}>{getButtonLabel()}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error(`Failed to fetch plan card`, error);
    return null;
  }
};
