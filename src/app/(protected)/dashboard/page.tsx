import {
  Announcement,
  AnnouncementsCard,
} from "@/components/dashboard/announcements";
import { Meeting, MeetingCard } from "@/components/dashboard/meeting-card";
import { PageHeader } from "@/components/dashboard/page-header";
import DashboardSkeleton from "@/components/dashboard/skeleton";
import React from "react";

const meetings: Meeting[] = [
  {
    id: 0,
    title: "Weekly Check-In: Emotional Balance",
    when: new Date(),
    type: "group",
    active: true,
    url: "/",
  },
  {
    id: 1,
    title: "Creating Through Life",
    when: new Date(),
    type: "webinar",
    url: "/",
  },
  {
    id: 2,
    title: "1:1 Coaching with Jamie",
    when: new Date(),
    type: "oneToOne",
    url: "/",
  },
];

const announcements: Announcement[] = [
  {
    id: 0,
    title: "New 1:1 Coaching Sessions Available",
    when: new Date(),
    description:
      "Premium members can now schedule 1:1 coaching sessions with our mental wellness guides.",
    prompt: "Learn more",
    url: "/",
  },
  {
    id: 1,
    title: "Sun Up, Sun Down Program Launch",
    when: new Date(),
    description:
      "A new daily mindfulness routine is now available to all Lifeing users. Start your day right.",
    prompt: "Explore the program",
    url: "/",
  },
  {
    id: 2,
    title: "New Articles in the Resource Library",
    when: new Date(),
    description:
      "We've added 10+ expert-written articles on topics like burnout, emotional sobriety, and more.",
    prompt: "Read now",
    url: "/",
  },
];

const Page = () => {
  const isLoading = false;

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
                <p className="text-sm"> You have no upcoming meetings.</p>
              )}
              {meetings.map((meeting, i) => (
                <MeetingCard key={i} meeting={meeting} />
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

  return <PageHeader title="Dashboard">{content}</PageHeader>;
};

export default Page;
