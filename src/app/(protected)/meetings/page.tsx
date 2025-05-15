import { Breadcrumb } from "@/components/dashboard/header";
import { Meeting, MeetingCard } from "@/components/dashboard/meeting-card";
import PageTemplate from "@/components/dashboard/page-template";
import DashboardSkeleton from "@/components/dashboard/skeleton";
import React from "react";

const breadcrumbs: Breadcrumb[] = [{ label: "My Meetings" }];

const today = new Date();

const meetings: Meeting[] = [
  {
    id: 0,
    title: "Weekly Check-In: Emotional Balance",
    when: today,
    type: "group",
    active: true,
    url: "/",
  },
  {
    id: 1,
    title: "Creating Through Life",
    when: today,
    type: "webinar",
    url: "/",
  },
  {
    id: 2,
    title: "1:1 Coaching with Jamie",
    when: today,
    type: "oneToOne",
    url: "/",
  },
];

const groupedMeetings = [
  {
    when: today,
    meetings: [...meetings],
  },
  {
    when: new Date(today.setDate(today.getDate() + 1)),
    meetings: [],
    noMeetingMessage: "No meetings scheduled for tomorrow",
  },
  {
    when: new Date(new Date().setMonth(today.getMonth() + 1)),
    meetings: [...meetings, ...meetings],
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
        {groupedMeetings.map((group, groupId) =>
          group.meetings.length ? (
            <section key={groupId} className="mb-5">
              <h2 className="text-xl font-normal mb-2">
                {group.when.toLocaleDateString()}
              </h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {group.meetings.map((meeting, i) => (
                  <MeetingCard key={i} meeting={meeting} />
                ))}
              </div>
            </section>
          ) : (
            <div
              key={groupId}
              className="relative text-sm text-center after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border py-3"
            >
              <span className="text-muted-foreground relative z-10 bg-background px-2">
                {group.noMeetingMessage || (
                  <>
                    No meetings scheduled for{" "}
                    {group.when.toLocaleDateString()}{" "}
                  </>
                )}
              </span>
            </div>
          )
        )}
      </>
    );
  }

  return (
    <PageTemplate title="My Meetings" breadcrumbs={breadcrumbs}>
      {content}
    </PageTemplate>
  );
};

export default Page;
