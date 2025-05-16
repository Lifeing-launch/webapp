import React from "react";

const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col flex-1 gap-4 p-4 pt-0 w-full h-full lg:flex-row">
      {/* Skeleton for Upcoming Meetings */}
      <section className="flex-1">
        <div className="h-6 w-1/3 bg-muted/50 rounded mb-4" />
        <div className="flex flex-col gap-4">
          <div className="h-32 w-full bg-muted/50 rounded" />
          <div className="h-32 w-full bg-muted/50 rounded" />
          <div className="h-32 w-full bg-muted/50 rounded" />
        </div>
      </section>

      {/* Skeleton for Announcements */}
      <section className="w-full lg:max-w-sm">
        <div className="h-6 w-1/3 bg-muted/50 rounded mb-4" />
        <div className="h-32 w-full bg-muted/50 rounded" />
        <div className="h-32 w-full bg-muted/50 rounded" />
      </section>
    </div>
  );
};

export default DashboardSkeleton;
