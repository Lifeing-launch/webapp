"use client";

import { MeetingCard } from "@/components/meetings/meeting-card";
import { formatDate } from "@/utils/datetime";
import React, { useEffect, useState } from "react";
import MeetingsSkeleton from "@/components/meetings/skeleton";
import { toast } from "sonner";
import { Meeting } from "@/typing/strapi";
import {
  DateRange,
  DateRangePicker,
} from "@/components/ui/custom/date-range-picker";
import qs from "qs";

type HydratedMeeting = Meeting & { hasRsvped?: boolean };

type GroupedMessage = {
  when: string;
  meetings: HydratedMeeting[];
  noMeetingMessage?: string;
};

type MeetingsTabProps = {
  initialDateRange: DateRange;
  showDatePicker?: boolean;
};

export const MeetingsTab = ({
  initialDateRange,
  showDatePicker,
}: MeetingsTabProps) => {
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [groupedMeetings, setGroupedMeetings] = useState<GroupedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          setGroupedMeetings(groupMeetingsByDate(meetings, dateRange));
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
    <>
      <div className="mb-3 flex justify-center">
        {showDatePicker && (
          <div>
            <DateRangePicker
              onUpdate={(values) => setDateRange(values.range)}
              initialDateFrom={dateRange.from}
              initialDateTo={dateRange.to}
              align="center"
              showCompare={false}
            />
          </div>
        )}
      </div>
      {content}
    </>
  );
};

const groupMeetingsByDate = (
  meetings: HydratedMeeting[],
  dateRange: DateRange
) => {
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

  // Helper function to check if a date falls within the date range
  const isDateInRange = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return (
      startOfDay >= dateRange.from &&
      startOfDay <= (dateRange.to || dateRange.from)
    );
  };

  // Only include today and tomorrow if they fall within the selected date range
  [todayDateKey, tomorrowDateKey].forEach((dateKey) => {
    const date = dateKey === todayDateKey ? today : tomorrow;
    if (isDateInRange(date)) {
      grouped.push({
        when: `${dateKey === todayDateKey ? "Today" : "Tomorrow"} - ${dateKey}`,
        meetings: meetingsByDate[dateKey] || [],
        noMeetingMessage: meetingsByDate[dateKey]
          ? undefined
          : `No meetings scheduled for ${dateKey === todayDateKey ? "today" : "tomorrow"}`,
      });
    }
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
