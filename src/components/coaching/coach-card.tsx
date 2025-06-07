import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CalendarHeart, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { Coach } from "@/typing/strapi";

interface ICoachCard {
  coach: Coach;
  className?: string;
}

export function CoachCard({ coach, className }: ICoachCard) {
  return (
    <Card className={cn("w-full gap-4", className)} data-testid="coach-card">
      <CardHeader className="flex flex-col gap-4 items-center">
        <div className="w-25 h-25 overflow-hidden">
          <Image
            src={coach.avatar.url}
            className="object-cover w-full"
            alt={coach.name}
            width={200}
            height={200}
          />
        </div>
        <CardTitle className="text-center">{coach.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 text-xs text-center">
        <CoachStat
          stat={coach.focus_areas.join(", ")}
          IconComponent={HeartHandshake}
        />
        <CoachStat
          stat={`${coach.experience_in_years}+ years`}
          IconComponent={CalendarHeart}
        />
        <p> {coach.summary} </p>
      </CardContent>
      <CardFooter className="flex gap-4 justify-center">
        <Link href={coach.booking_url}>
          <Button>Book a session</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

const CoachStat = ({
  stat,
  IconComponent,
}: {
  stat: string;
  IconComponent: typeof HeartHandshake;
}) => {
  return (
    <div className="flex gap-2 font-medium">
      <IconComponent className="size-4 text-primary" />
      {stat}
    </div>
  );
};
