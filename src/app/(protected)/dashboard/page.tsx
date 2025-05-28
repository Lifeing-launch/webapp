"use client";

import {
  Announcement,
  AnnouncementsCard,
} from "@/components/dashboard/announcements";
import { Breadcrumb } from "@/components/layout/header";
import { Meeting, MeetingCard } from "@/components/meetings/meeting-card";
import PageTemplate from "@/components/layout/page-template";
import DashboardSkeleton from "@/components/dashboard/skeleton";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

const breadcrumbs: Breadcrumb[] = [{ label: "Dashboard" }];

const Page = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      const res = await fetch("/api/user/meetings?rsvpOnly=1");
      const data: { data?: Meeting[]; error?: string } = await res.json();
      if (data.error) {
        toast.error(data.error);
      }

      setMeetings(data?.data || []);
    };

    const fetchAnnouncements = async () => {
      const res = await fetch("/api/user/announcements");
      const data: { data?: Announcement[]; error?: string } = await res.json();
      if (data.error) {
        toast.error(data.error);
      }

      setAnnouncements(data?.data || []);
    };

    const fetchData = async () => {
      await fetchMeetings();
      await fetchAnnouncements();
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
