import React from "react";
import { Check, Clock, MonitorPlay, UserRoundCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Meeting {
  id: number;
  title: string;
  description?: string;
  when: Date;
  type: "group" | "webinar" | "oneToOne";
  url: string;
  active?: boolean;
}

interface IMeetingCard {
  meeting: Meeting;
  className?: string;
}

export function MeetingCard({ meeting, className }: IMeetingCard) {
  return (
    <Card
      className={cn(
        "w-full gap-3",
        meeting.active ? "bg-lime-50 border-l-3 border-l-[#65A30D]" : undefined,
        className
      )}
    >
      <CardHeader>
        <CardTitle>{meeting.title}</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <MeetingStats meeting={meeting} />
      </CardContent>
      {meeting.active && (
        <CardFooter>
          <Button>
            <Check /> Join meeting
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function MeetingStats({ meeting }: { meeting: Meeting }) {
  const statsToDisplay: (keyof Meeting)[] = ["when", "type"];
  const typeDisplayMapping = {
    group: {
      label: "Group Session",
      Icon: Users,
    },
    webinar: {
      label: "Webinar",
      Icon: MonitorPlay,
    },
    oneToOne: {
      label: "1:1",
      Icon: UserRoundCheck,
    },
  };

  const iconRenderer = (Icon: typeof Clock) => {
    return <div className="text-primary mr-3">{<Icon width={15} />}</div>;
  };

  const statRenderer = (statKey: keyof Meeting) => {
    switch (statKey) {
      case "when": {
        return (
          <>
            {iconRenderer(Clock)}
            <span>{meeting[statKey].toLocaleString()}</span>
          </>
        );
      }
      case "type": {
        const { Icon, label } = typeDisplayMapping[meeting[statKey]];
        return (
          <>
            {iconRenderer(Icon)}
            {label}
          </>
        );
      }
    }
  };

  return statsToDisplay.map((statKey) => (
    <div key={statKey} className="flex items-center text-xs font-medium">
      {statRenderer(statKey)}
    </div>
  ));
}
