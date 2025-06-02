"use client";

import { Breadcrumb } from "@/components/layout/header";
import { Meeting, MeetingCard } from "@/components/meetings/meeting-card";
import PageTemplate from "@/components/layout/page-template";
import { formatDate } from "@/utils/datetime";
import { createClient } from "@/utils/supabase/browser";
import React, { useEffect, useState } from "react";
import MeetingsSkeleton from "@/components/meetings/skeleton";
import { toast } from "sonner";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";

const breadcrumbs: Breadcrumb[] = [{ label: "My Meetings" }];

type EnrichedMeeting = Meeting & { hasRsvped?: boolean };

type GroupedMessage = {
  when: string;
  meetings: EnrichedMeeting[];
  noMeetingMessage?: string;
};

const MeetingsPage = () => {
  const [groupedMeetings, setGroupedMeetings] = useState<GroupedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Unauthorized");
        }

        // Fetch all future meetings
        const res = await fetch("/api/user/meetings");
        const data: { data?: Meeting[]; error?: string } = await res.json();

        if (data.error) {
          throw new Error(data.error);
        } else {
          const meetings = data.data;

          // Fetch RSVPs for the current user
          const { data: rsvps } = await supabase
            .from("rsvps")
            .select("meeting_id")
            .eq("user_id", user.id);

          // Map RSVP data to meetings
          const rsvpedMeetingIds = new Set(
            rsvps?.map((rsvp) => Number(rsvp.meeting_id))
          );
          const enrichedMeetings = (meetings || []).map((meeting) => ({
            ...meeting,
            hasRsvped: rsvpedMeetingIds.has(meeting.id),
          }));

          setGroupedMeetings(
            enrichedMeetings.length ? groupMeetingsByDate(enrichedMeetings) : []
          );
        }
      } catch (err) {
        console.error("Error fetching meetings: ", err);
        toast.error("Error fetching meetings");
        setGroupedMeetings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  let content = <></>;

  if (isLoading) {
    content = <MeetingsSkeleton />;
  } else if (!groupedMeetings.length) {
    content = <p className="text-sm"> There are no meetings to display.</p>;
  } else {
    content = (
      <>
        {groupedMeetings.map((group, groupId) =>
          group.meetings.length ? (
            <section key={groupId} className="mb-5">
              <h2 className="text-xl font-normal mb-2">{group.when}</h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {group.meetings.map((meeting, i) => (
                  <MeetingCard
                    key={i}
                    meeting={meeting}
                    hasRsvped={meeting.hasRsvped}
                  />
                ))}
              </div>
            </section>
          ) : (
            group.noMeetingMessage && (
              <div
                key={groupId}
                className="relative text-sm text-center after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border py-3"
              >
                <span className="text-muted-foreground relative z-10 bg-background px-2">
                  {group.noMeetingMessage}
                </span>
              </div>
            )
          )
        )}
      </>
    );
  }

  return (
    <PageTemplate
      title="My Meetings"
      breadcrumbs={breadcrumbs}
      headerIcon={sidebarIcons.meetings}
    >
      {content}
    </PageTemplate>
  );
};

export default MeetingsPage;

const groupMeetingsByDate = (meetings: EnrichedMeeting[]) => {
  const meetingsByDate = meetings.reduce(
    (acc, meeting) => {
      const dateKey = formatDate(new Date(meeting.when));
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(meeting);
      return acc;
    },
    {} as Record<string, EnrichedMeeting[]>
  );

  const grouped: GroupedMessage[] = [];

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayDateKey = formatDate(today);
  const tomorrowDateKey = formatDate(tomorrow);

  [todayDateKey, tomorrowDateKey].forEach((dateKey) => {
    grouped.push({
      when: dateKey,
      meetings: meetingsByDate[dateKey] || [],
      noMeetingMessage: meetingsByDate[dateKey]
        ? undefined
        : `No meetings scheduled for ${dateKey === todayDateKey ? "today" : "tomorrow"}`,
    });
  });

  Object.keys(meetingsByDate).forEach((dateKey) => {
    if (dateKey !== todayDateKey && dateKey !== tomorrowDateKey) {
      grouped.push({
        when: dateKey,
        meetings: meetingsByDate[dateKey],
      });
    }
  });

  return grouped.sort(
    (a, b) => new Date(a.when).getTime() - new Date(b.when).getTime()
  );
};
