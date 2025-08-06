"use client";

import { Breadcrumb } from "@/components/layout/header";
import { MeetingCard } from "@/components/meetings/meeting-card";
import PageTemplate from "@/components/layout/page-template";
import { formatDate } from "@/utils/datetime";
import React, { useEffect, useState } from "react";
import MeetingsSkeleton from "@/components/meetings/skeleton";
import { toast } from "sonner";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import { Meeting } from "@/typing/strapi";
import {
  DateRange,
  DateRangePicker,
} from "@/components/ui/custom/date-range-picker";
import qs from "qs";

const breadcrumbs: Breadcrumb[] = [{ label: "My Meetings" }];

type HydratedMeeting = Meeting & { hasRsvped?: boolean };

type GroupedMessage = {
  when: string;
  meetings: HydratedMeeting[];
  noMeetingMessage?: string;
};

const startOfCurrentMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  1,
  0,
  0,
  0,
  0
);

const endOfCurrentMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  0,
  23,
  59,
  59,
  999
);

const MeetingsPage = () => {
  const [groupedMeetings, setGroupedMeetings] = useState<GroupedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfCurrentMonth,
    to: endOfCurrentMonth,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const query = qs.stringify({
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to?.toISOString(),
          hydrateRsvp: true,
        });

        // Fetch meetings with RSVP status hydrated from backend
        const res = await fetch(`/api/meetings?${query}`);
        const data: { data?: HydratedMeeting[]; error?: string } =
          await res.json();

        if (data.error) {
          throw new Error(data.error);
        } else {
          const meetings = data.data || [];
          setGroupedMeetings(
            meetings.length ? groupMeetingsByDate(meetings) : []
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
  }, [dateRange]);

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
      <div className="mb-3">
        <DateRangePicker
          onUpdate={(values) => setDateRange(values.range)}
          initialDateFrom={dateRange.from}
          initialDateTo={dateRange.to}
          align="start"
          showCompare={false}
        />
      </div>
      {content}
    </PageTemplate>
  );
};

export default MeetingsPage;

const groupMeetingsByDate = (meetings: HydratedMeeting[]) => {
  const meetingsByDate = meetings.reduce(
    (acc, meeting) => {
      const dateKey = formatDate(new Date(meeting.when));
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(meeting);
      return acc;
    },
    {} as Record<string, HydratedMeeting[]>
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
