import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { CircleCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Plan } from "@/typing/global";
import { Badge } from "../ui/badge";
import Link from "next/link";

export const PlanCard = ({ plan }: { plan: Plan }) => {
  return (
    <Card className={cn(plan.isMostPopular && "bg-lime-100")}>
      <CardContent className={"flex flex-col gap-9 h-full"}>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h1 className="font-medium">{plan.name}</h1>
            {plan.isMostPopular && <Badge> Most popular</Badge>}
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
