import React from "react";
import { Check, Clock, MonitorPlay, UserRoundCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Database } from "@/typing/supabase";
import {
  datetimeIsWithinInterval,
  formatDate,
  formatTime,
} from "@/utils/datetime";
import RsvpButton from "./rsvp-button";

export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
type MeetingType = "group" | "webinar" | "oneToOne";
interface IMeetingCard {
  meeting: Meeting;
  className?: string;
  showRsvp?: boolean;
  hasRsvped?: boolean;
}

const HIGHLIGHT_MEETING_INTERVAL = 60; // 1 hour

export function MeetingCard({
  meeting,
  className,
  hasRsvped,
  showRsvp = true,
}: IMeetingCard) {
  const isHighlighted = datetimeIsWithinInterval(
    meeting.when,
    HIGHLIGHT_MEETING_INTERVAL
  );
  return (
    <Card
      className={cn(
        "w-full gap-3",
        isHighlighted ? "bg-lime-50 border-l-3 border-l-[#65A30D]" : undefined,
        className
      )}
      data-testid="meeting-card"
    >
      <CardHeader>
        <CardTitle>{meeting.title}</CardTitle>
      </CardHeader>
      <CardContent className="gap-2">
        <MeetingStats meeting={meeting} />
        <p className="text-sm"> {meeting.description} </p>
      </CardContent>
      <CardFooter className="flex gap-4">
        {showRsvp && (
          <RsvpButton hasRsvped={hasRsvped} meetingId={meeting.id} />
        )}
        {hasRsvped && isHighlighted && (
          <Button className="flex-1">
            <Check /> Join meeting
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function MeetingStats({ meeting }: { meeting: Meeting }) {
  const statsToDisplay: (keyof Meeting)[] = ["when", "meeting_type"];
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
    return (
      <div className="text-primary mr-3" data-testid="meeting-stat-icon">
        {<Icon width={15} />}
      </div>
    );
  };

  const statRenderer = (statKey: keyof Meeting) => {
    switch (statKey) {
      case "when": {
        const when = new Date(meeting[statKey]);
        return (
          <>
            {iconRenderer(Clock)}
            <span>
              {formatDate(when)} - {formatTime(when)}
            </span>
          </>
        );
      }
      case "meeting_type": {
        const { Icon, label } =
          typeDisplayMapping[meeting[statKey] as MeetingType];
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
    <div key={statKey} className="flex items-center text-xs font-medium mb-2">
      {statRenderer(statKey)}
    </div>
  ));
}
