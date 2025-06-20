import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

const plans = [
  {
    id: 1,
    name: "Lifeing Essentials",
    price: 75,
    mostPopular: true,
    benefits: [
      "Full access to our 50+ meetings per month (That’s less than $2 per session!)",
      "Access to upcoming features including a resource library",
      "Exclusive tools and merchandise",
      "A welcoming landing spot for community and connection",
    ],
  },
  {
    id: 2,
    name: "Lifeing Essentials + 1 Focused Group",
    price: 100,
    benefits: [
      "Includes everything in Lifeing Essentials",
      "Access to one closed focused group coaching offering (Mindful Moderation currently available)",
      "More small focused groups coming soon!",
      "Continued access to exciting upcoming features including the resource library, merchandise, exclusive tools, and a hub for community and connection",
    ],
  },
  {
    id: 3,
    name: "Founding Member | Benefactor Tier",
    price: 150,
    benefits: [
      "Includes everything in Lifeing Essentials and Lifeing + Coaching",
      "Discounted access to all closed groups as they launch",
      "Advanced notice for upcoming events",
      "Exclusive offers",
      "Access to all future features including the resource library, merchandise, exclusive tools, and a hub for community and connection",
    ],
  },
];

const PlanCard = ({ plan }: { plan: (typeof plans)[number] }) => {
  return (
    <Card className={cn(plan.mostPopular && "bg-purple-50")}>
      <CardContent className={"flex flex-col gap-9 h-full"}>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h1 className="font-medium">{plan.name}</h1>
            {plan.mostPopular && <Badge> Most popular</Badge>}
          </div>
          <h2 className="text-2xl font-semibold">
            {"$"}
            {plan.price}/month
          </h2>
        </div>

        <ul className="flex flex-col gap-2 flex-1 text-sm text-zinc-700 mb-5">
          {plan.benefits.map((benefit, index) => (
            <li key={index} className="flex gap-2">
              <CircleCheck size={20} className="mt-[2]" />
              <span className="flex-1">{benefit}</span>
            </li>
          ))}
        </ul>

        <Button asChild>
          <Link href="/dashboard">Continue</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const Plans = () => {
  return (
    <div className="w-full">
      <Card>
        <CardContent className="flex flex-col gap-9">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold">Select Your Plan</h1>
            <p className="text-sm text-muted-foreground">
              Free for the first 10 days. Cancel anytime.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard plan={plan} key={plan.id} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Plans;
