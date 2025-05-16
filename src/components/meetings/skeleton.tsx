import React from "react";

const MeetingsSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Skeleton for Grouped Meetings */}
      {[1, 2, 3].map((_, groupId) => (
        <section key={groupId} className="mb-5">
          {/* Skeleton for Group Title */}
          <div className="h-6 w-1/4 bg-muted/50 rounded mb-4" />
          {/* Skeleton for Meeting Cards */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="h-36 w-full bg-muted/50 rounded" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default MeetingsSkeleton;
