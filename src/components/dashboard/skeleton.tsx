import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

const DashboardSkeleton = () => {
  return (
    <div className="w-full">
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
