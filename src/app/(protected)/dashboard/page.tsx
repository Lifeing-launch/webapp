"use client";

import {
  Announcement,
  AnnouncementsCard,
} from "@/components/dashboard/announcements";
import { Breadcrumb } from "@/components/layout/header";
import { Meeting, MeetingCard } from "@/components/meetings/meeting-card";
import PageTemplate from "@/components/layout/page-template";
import DashboardSkeleton from "@/components/dashboard/skeleton";
import { createClient } from "@/utils/supabase/browser";
import React, { useEffect, useState } from "react";
import Link from "next/link";

const breadcrumbs: Breadcrumb[] = [{ label: "Dashboard" }];

const Page = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch future RSVPed meetings
      const { data: rsvps } = await supabase
        .from("rsvps")
        .select("meeting:meeting_id(*)")
        .eq("user_id", user.id)
        .gt("meeting.when", new Date().toISOString());

      const meetings = rsvps
        ?.map((m) => m.meeting)
        .filter((meeting): meeting is Meeting => !!meeting);
      setMeetings(meetings || []);

      // Fetch announcements
      const { data: announcements } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setAnnouncements(announcements || []);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  let content = <></>;

  if (isLoading) {
    content = <DashboardSkeleton />;
  } else {
    content = (
      <>
        <div className="flex flex-col flex-1 gap-4 p-4 pt-0 w-full h-full lg:flex-row">
          <section className="flex-1">
            <h2 className="text-xl font-normal mb-2"> Upcoming meetings</h2>
            <div className="flex flex-col gap-4">
              {!meetings.length && (
                <p className="text-sm">
                  You have no upcoming meetings.{" "}
                  <Link href="/meetings" className="text-primary">
                    Explore and RSVP to upcoming meetings here.{" "}
                  </Link>{" "}
                </p>
              )}
              {meetings.map((meeting, i) => (
                <MeetingCard key={i} meeting={meeting} showRsvp={false} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-normal mb-2"> Announcements </h2>
            {announcements.length ? (
              <AnnouncementsCard announcements={announcements} />
            ) : (
              <p className="text-sm"> There are no new announcements</p>
            )}
          </section>
        </div>
      </>
    );
  }

  return (
    <PageTemplate title="Dashboard" breadcrumbs={breadcrumbs}>
      {content}
    </PageTemplate>
  );
};

export default Page;
