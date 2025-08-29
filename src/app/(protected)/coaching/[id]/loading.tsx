import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import React from "react";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoachProfileLoading() {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Coaching", href: "/coaching" },
    { label: "Loading..." },
  ];

  return (
    <PageTemplate
      breadcrumbs={breadcrumbs}
      headerIcon={sidebarIcons.coachingProgram}
    >
      <div className="max-w-4xl mx-auto mt-10">
        {/* Header with coach info */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start">
          <Skeleton className="w-32 h-32 rounded-full flex-shrink-0" />
          <div className="w-full">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-40" />
            </div>

            <div className="mt-6">
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>

        {/* Extended bio skeleton */}
        <div className="mt-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />

          <Skeleton className="h-6 w-64 mb-4 mt-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
        </div>
      </div>
    </PageTemplate>
  );
}
