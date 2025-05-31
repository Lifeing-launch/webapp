import React from "react";

const ResourcesSkeleton = () => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 auto-rows-fr">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="flex flex-row items-stretch gap-3 p-4 border shadow-sm rounded-xl animate-pulse"
          >
            {/* Preview Image Skeleton */}
            <div className="bg-muted/50 rounded h-35 flex-1" />

            {/* Content Skeleton */}
            <div className="flex flex-col flex-1 gap-3">
              <div>
                {/* Title Skeleton */}
                <div className="h-4 bg-muted/50 rounded w-3/4 mb-2" />
                {/* Description Skeleton */}
                <div className="h-3 bg-muted/50 rounded mb-1" />
                <div className="h-3 bg-muted/50 rounded w-5/6" />
              </div>
              {/* Badge and Date Skeleton */}
              <div className="flex gap-2 mt-2">
                <div className="h-3 bg-muted/50 rounded w-16" />
                <div className="h-3 bg-muted/50 rounded w-24" />
              </div>
            </div>

            {/* Bookmark Icon Skeleton */}
            <div className="">
              <div className="h-6 w-6 bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesSkeleton;
