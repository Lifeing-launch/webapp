"use client";

import React from "react";
import {
  Brain,
  Check,
  Clock,
  MonitorPlay,
  Sparkle,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { datetimeIsWithinInterval } from "@/utils/datetime";
import RsvpButton from "./rsvp-button";
import { Meeting, MeetingType } from "@/typing/strapi";
import { useSectionColors } from "@/hooks/use-section-colors";
import ClientDateTime from "@/components/ui/client-datetime";
import Link from "next/link";

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
  const { colors } = useSectionColors();
  const isHighlighted = datetimeIsWithinInterval(
    meeting.when,
    HIGHLIGHT_MEETING_INTERVAL
  );
  return (
    <Card
      className={cn(
        "w-full gap-3",
        isHighlighted ? "bg-lime-100 border-l-3" : undefined,
        className
      )}
      style={isHighlighted ? { borderLeftColor: colors.primary } : {}}
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
        {meeting.url && (
          <Link href={meeting.url}>
            <Button className="flex-1">
              <Check /> Join meeting
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

function MeetingStats({ meeting }: { meeting: Meeting }) {
  const { colors } = useSectionColors();
  const statsToDisplay: (keyof Meeting)[] = ["when", "meeting_type"];
  const typeDisplayMapping: Record<
    MeetingType,
    { label: string; Icon: React.ElementType }
  > = {
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
    "one-to-one": {
      label: "1:1",
      Icon: UserRoundCheck,
    },
    event: {
      label: "Event",
      Icon: Sparkle,
    },
    "mindful-moderation": {
      label: "Mindful Moderation",
      Icon: Brain,
    },
  };

  const iconRenderer = (Icon: React.ElementType) => {
    return (
      <div
        className="mr-3"
        data-testid="meeting-stat-icon"
        style={{ color: colors.primary }}
      >
        {<Icon width={15} />}
      </div>
    );
  };

  const statRenderer = (statKey: keyof Meeting) => {
    switch (statKey) {
      case "when": {
        return (
          <>
            {iconRenderer(Clock)}
            <ClientDateTime
              date={meeting[statKey]}
              format="datetime"
              fallback="Loading time..."
            />
          </>
        );
      }
      case "meeting_type": {
        const { Icon, label } =
          typeDisplayMapping[meeting[statKey] as MeetingType] || {};

        if (!Icon || !label) {
          return null;
        }

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
