import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

const DashboardSkeleton = () => {
  return (
    <div className="w-full">
      {/* Dashboard Banner Skeleton */}
      <DashboardBannerSkeleton />

      {/* First Dashboard Row */}
      <DashboardRowSkeleton
        leftContent={
          <>
            <SectionHeadingSkeleton />
            <div className="flex flex-col gap-4">
              <div className="h-32 w-full bg-muted/50 rounded" />
              <div className="h-32 w-full bg-muted/50 rounded" />
            </div>
          </>
        }
        rightContent={
          <>
            <SectionHeadingSkeleton />
            <div className="flex flex-col gap-4">
              <div className="h-32 w-full bg-muted/50 rounded" />
              <div className="h-32 w-full bg-muted/50 rounded" />
            </div>
          </>
        }
      />

      {/* Second Dashboard Row */}
      <DashboardRowSkeleton
        leftContent={
          <>
            <SectionHeadingSkeleton />
            <div className="h-32 w-full bg-muted/50 rounded" />
          </>
        }
        rightContent={
          <>
            <SectionHeadingSkeleton />
            <div className="flex flex-col gap-4">
              <div className="h-32 w-full bg-muted/50 rounded" />
              <div className="h-32 w-full bg-muted/50 rounded" />
            </div>
          </>
        }
      />
    </div>
  );
};

const DashboardRowSkeleton = ({
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

const SectionHeadingSkeleton = () => {
  return (
    <div className="flex justify-between align-middle mb-2">
      <div className="h-6 w-1/3 bg-muted/50 rounded" />
      <div className="h-4 w-16 bg-muted/50 rounded" />
    </div>
  );
};

const DashboardBannerSkeleton = () => {
  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden flex items-end mb-6 bg-muted/50 rounded">
      {/* Change Cover Button Skeleton */}
      <div className="absolute top-4 right-4 z-20 h-9 w-32 bg-muted/70 rounded" />

      {/* Content Area Skeleton */}
      <div className="relative z-10 p-6 md:p-10 w-full flex flex-col md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          {/* Welcome Title Skeleton */}
          <div className="h-8 w-48 bg-muted/70 rounded" />
          {/* Quote Skeleton */}
          <div className="space-y-1 max-w-2xl">
            <div className="h-4 w-80 bg-muted/70 rounded" />
            <div className="h-4 w-32 bg-muted/70 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export function AnnouncementSkeleton({ isSidebar }: { isSidebar?: boolean }) {
  return (
    <section
      className={cn("w-full flex flex-col gap-2", isSidebar && "lg:max-w-sm")}
    >
      {isSidebar && <div className="h-6 w-1/3 bg-muted/50 rounded mb-4" />}
      <div className="h-32 w-full bg-muted/50 rounded" />
      <div className="h-32 w-full bg-muted/50 rounded" />
      <div className="h-32 w-full bg-muted/50 rounded" />
    </section>
  );
}

export default DashboardSkeleton;
