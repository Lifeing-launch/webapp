"use client";

import {
  Announcement,
  AnnouncementsCard,
} from "@/components/dashboard/announcements";
import { MeetingCard } from "@/components/meetings/meeting-card";
import DashboardSkeleton from "@/components/dashboard/skeleton";
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Meeting, Resource } from "@/typing/strapi";
import qs from "qs";
import DashboardBanner from "@/components/dashboard/banner";
import { ResourceCard } from "@/components/resources/resource-card";

const today = new Date();
const inThirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

const DashboardPage = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [visualResources, setVisualResources] = useState<Resource[]>([]);
  const [audioResources, setAudioResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const query = qs.stringify({
          dateFrom: today,
          dateTo: inThirtyDays,
          rsvpOnly: true,
        });

        const res = await fetch(`/api/meetings?${query}`);
        const data: { data?: Meeting[]; error?: string } = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setMeetings(data?.data || []);
      } catch (err) {
        toast.error("Error fetching meetings");
        console.error("Error fetching meetings: ", err);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements");
        const data: { data?: Announcement[]; error?: string } =
          await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setAnnouncements(data?.data || []);
      } catch (err) {
        toast.error("Error fetching announcements");
        console.error("Error fetching announcements: ", err);
      }
    };

    const fetchVisualResources = async () => {
      try {
        const query = qs.stringify({
          page: 1,
          pageSize: 2,
          type: "bookmark",
          category: "visual",
        });
        const res = await fetch(`/api/resources?${query}`);
        const data: { data?: Resource[]; error?: string } = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setVisualResources(data?.data || []);
      } catch (err) {
        toast.error("Error fetching bookmarked resources");
        console.error("Error fetching bookmarked resources: ", err);
      }
    };

    const fetchAudioResources = async () => {
      try {
        const query = qs.stringify({
          page: 1,
          pageSize: 2,
          type: "bookmark",
          category: "audio",
        });
        const res = await fetch(`/api/resources?${query}`);
        const data: { data?: Resource[]; error?: string } = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setAudioResources(data?.data || []);
      } catch (err) {
        toast.error("Error fetching bookmarked audio");
        console.error("Error fetching bookmarked audio: ", err);
      }
    };

    const fetchData = async () => {
      await fetchMeetings();
      await fetchAnnouncements();
      await fetchVisualResources();
      await fetchAudioResources();
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
        <DashboardRow
          leftContent={
            <>
              <SectionHeading
                title="Upcoming meetings"
                href="/meetings"
                linkLabel="All Meetings"
                showLink={!!meetings.length}
              />
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
            </>
          }
          rightContent={
            <>
              <SectionHeading
                title="Bookmarked Resources"
                href="/resources?tab=bookmark"
                showLink={!!visualResources.length}
              />
              {visualResources.length ? (
                <div className={"flex flex-col gap-4"}>
                  {visualResources.map((resource) => (
                    <ResourceCard
                      resource={resource}
                      key={resource.id}
                      category="visual"
                      hideBookmark
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm">
                  {" "}
                  You have no bookmarked resources.{" "}
                  <Link href="/resources" className="text-primary">
                    Explore available resources here.{" "}
                  </Link>{" "}
                </p>
              )}
            </>
          }
        />
        <DashboardRow
          leftContent={
            <>
              <SectionHeading
                title="Announcements"
                href="/dashboard/announcements"
                linkLabel="See All"
                showLink={!!announcements.length}
              />
              {announcements.length ? (
                <AnnouncementsCard announcements={announcements} />
              ) : (
                <p className="text-sm">
                  There are no new announcements.{" "}
                  <Link
                    href="/dashboard/announcements"
                    className="text-primary"
                  >
                    See all announcements.
                  </Link>{" "}
                </p>
              )}
            </>
          }
          rightContent={
            <>
              <SectionHeading
                title="Bookmarked Audio"
                href="/audio-resources?tab=bookmark"
                showLink={!!audioResources.length}
              />
              {audioResources.length ? (
                <div className={"flex flex-col gap-4"}>
                  {audioResources.map((resource) => (
                    <ResourceCard
                      resource={resource}
                      key={resource.id}
                      category="audio"
                      hideBookmark
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm">
                  You have no bookmarked audio.{" "}
                  <Link href="/audio-resources" className="text-primary">
                    Explore available audio here.{" "}
                  </Link>{" "}
                </p>
              )}
            </>
          }
        />
      </>
    );
  }

  return (
    <div className="w-full">
      <DashboardBanner />
      {content}
    </div>
  );
};

const DashboardRow = ({
  leftContent,
  rightContent,
}: {
  leftContent: ReactNode;
  rightContent: ReactNode;
}) => {
  return (
    <div className="flex flex-col flex-1 gap-4 p-4 pt-0 w-full lg:flex-row">
      <section className="flex-4">{leftContent}</section>

      <section className="flex-3">{rightContent}</section>
    </div>
  );
};

const SectionHeading = ({
  title,
  linkLabel = "View all",
  href,
  showLink = true,
}: {
  title: string;
  linkLabel?: string;
  href: string;
  showLink?: boolean;
}) => {
  return (
    <div className="flex justify-between align-middle">
      <h2 className="text-xl font-normal mb-2">{title}</h2>
      {showLink && (
        <Link href={href} className="mr-2 text-sm text-primary font-medium">
          {linkLabel}
        </Link>
      )}
    </div>
  );
};

export default DashboardPage;
