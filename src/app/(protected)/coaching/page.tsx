"use client";

import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import { createClient } from "@/utils/supabase/browser";
import React, { useEffect, useState } from "react";
import MeetingsSkeleton from "@/components/meetings/skeleton";
import { toast } from "sonner";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import { CoachCard } from "@/components/coaching/coach-card";
import { Coach } from "@/typing/strapi";

const breadcrumbs: Breadcrumb[] = [{ label: "My Meetings" }];

const CoachingPage = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
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
        const res = await fetch("/api/coaches");
        const data: { data?: Coach[]; error?: string } = await res.json();

        if (data.error) {
          throw new Error(data.error);
        } else {
          setCoaches(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching coaches: ", err);
        toast.error("Error fetching coaches");
        setCoaches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  let content = <></>;

  if (isLoading) {
    content = <MeetingsSkeleton />;
  } else if (!coaches.length) {
    content = <p className="text-sm"> There are no coaches to display.</p>;
  } else {
    content = (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows">
          {coaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      </>
    );
  }

  return (
    <PageTemplate
      title="Coaching Program"
      breadcrumbs={breadcrumbs}
      headerIcon={sidebarIcons.meetings}
    >
      {content}
    </PageTemplate>
  );
};

export default CoachingPage;
