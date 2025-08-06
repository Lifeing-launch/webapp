import {
  Announcement,
  AnnouncementsCard,
} from "@/components/dashboard/announcements";
import { MeetingCard } from "@/components/meetings/meeting-card";
import React, { ReactNode } from "react";
import Link from "next/link";
import { Meeting, Resource } from "@/typing/strapi";
import qs from "qs";
import DashboardBanner from "@/components/dashboard/banner";
import { ResourceCard } from "@/components/resources/resource-card";
import { serverFetch } from "@/utils/fetch";

const today = new Date();
const inThirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

function getRequestDataFromResult<T>(
  result: PromiseSettledResult<{ data?: T[] }>,
  context: string
): T[] {
  if (result.status === "fulfilled") {
    return result.value?.data || [];
  } else {
    console.error(`Failed to fetch ${context}:`, result.reason);
    return [];
  }
}

export default async function DashboardPage() {
  const [
    meetingsResult,
    announcementsResult,
    visualResourcesResult,
    audioResourcesResult,
  ] = await Promise.allSettled([
    // Meetings
    serverFetch(
      `/api/meetings?${qs.stringify({
        dateFrom: today,
        dateTo: inThirtyDays,
        rsvpOnly: true,
      })}`
    ),
    // Announcements
    serverFetch("/api/announcements"),
    // Visual Resources
    serverFetch(
      `/api/resources?${qs.stringify({
        page: 1,
        pageSize: 2,
        type: "bookmark",
        category: "visual",
      })}`
    ),
    // Audio Resources
    serverFetch(
      `/api/resources?${qs.stringify({
        page: 1,
        pageSize: 2,
        type: "bookmark",
        category: "audio",
      })}`
    ),
  ]);

  const meetings: Meeting[] = getRequestDataFromResult<Meeting>(
    meetingsResult,
    "meetings"
  );
  const announcements: Announcement[] = getRequestDataFromResult<Announcement>(
    announcementsResult,
    "announcements"
  );
  const visualResources: Resource[] = getRequestDataFromResult<Resource>(
    visualResourcesResult,
    "visual resources"
  );
  const audioResources: Resource[] = getRequestDataFromResult<Resource>(
    audioResourcesResult,
    "audio resources"
  );

  return (
    <div className="w-full">
      <DashboardBanner />
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
    </div>
  );
}

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
