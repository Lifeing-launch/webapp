import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import Image from "next/image";
import RsvpButton from "../meetings/rsvp-button";
import { Meeting, MindfulModerationSession } from "@/typing/strapi";
import { formatDate, formatTime } from "@/utils/datetime";

export type HydratedSession = MindfulModerationSession & {
  meeting: Meeting & { hasRsvped?: boolean };
};

export function GroupMeetings({ sessions }: { sessions: HydratedSession[] }) {
  return (
    <Card className="py-0 mt-2">
      <CardContent>
        <ul className="text-sm">
          {sessions.map((session, index) => (
            <MeetingItem key={index} session={session} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function MeetingItem({ session }: { session: HydratedSession }) {
  return (
    <li className="flex justify-between items-center border-b last:border-b-0 py-4">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-primary" />
        {}
        <span>
          {formatDate(new Date(session.meeting.when))} -{" "}
          {formatTime(new Date(session.meeting.when))}
        </span>
        <RsvpButton meetingId={session.meeting.id} />
      </div>
      <div className="flex items-center gap-2">
        {session?.coach?.avatar && (
          <div className="w-5 h-5 overflow-hidden rounded-full">
            <Image
              src={session.coach.avatar.url}
              className="object-cover w-full h-full"
              alt={session.coach.name}
              width={200}
              height={200}
            />
          </div>
        )}
        {session?.coach?.name && (
          <span className="block max-w-30 truncate" title={session.coach.name}>
            Coach: {session.coach.name}{" "}
          </span>
        )}
      </div>
    </li>
  );
}
