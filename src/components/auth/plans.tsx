import React from "react";
import { Card, CardContent } from "../ui/card";
import { Plan, PlanCard } from "../subscription/plan-card";

const plans: Plan[] = [
  {
    id: 1,
    name: "Lifeing Essentials",
    price: 75,
    isMostPopular: true,
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
