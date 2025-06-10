import React from "react";
import { Card, CardContent } from "../ui/card";
import { CalendarRange } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/datetime";
import { Plan } from "@/typing/global";

type Subscription = Plan & {
  billingCycle: "monthly" | "yearly";
  cardLastDigits: number;
  nextPaymentDue: Date;
  cardType: string;
};

const CurrentPlanCard = ({ subscription }: { subscription: Subscription }) => {
  const stats = [
    {
      label: "Billing Cycle",
      Icon: CalendarRange,
      value: subscription.billingCycle,
    },
    {
      label: "Payment Method",
      Icon: CalendarRange,
      value: `${subscription.cardType} ending in ${subscription.cardLastDigits}`,
    },
    {
      label: "Next Payment Due:",
      Icon: CalendarRange,
      value: formatDate(subscription.nextPaymentDue),
    },
  ];

  return (
    <Card>
      <CardContent className="gap-4 flex flex-col">
        <div>
          <p className="text-xs text-primary"> Current plan </p>
          <h2 className="font-medium">
            {" "}
            Lifeing Essentials + 1 Focused Group{" "}
          </h2>
          <p className="text-2xl font-semibold"> $100/month </p>
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
