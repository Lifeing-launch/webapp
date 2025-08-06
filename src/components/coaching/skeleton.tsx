import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

const CoachingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows">
      {[1, 2, 3, 4, 5, 6].map((_, i) => (
        <CoachCardSkeleton key={i} />
      ))}
    </div>
  );
};

const CoachCardSkeleton = () => {
  return (
    <Card className="w-full gap-4">
      <CardHeader className="flex flex-col gap-4 items-center">
        {/* Avatar skeleton - circular */}
        <Skeleton className="w-25 h-25 rounded-full" />
        {/* Name skeleton */}
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 text-xs text-center">
        {/* Stats skeletons - 2 items with icon placeholders */}
        <div className="flex gap-2 items-center">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        {/* Summary skeleton - multiple lines */}
        <div className="w-full space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4 mx-auto" />
          <Skeleton className="h-3 w-5/6 mx-auto" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-4 justify-center">
        {/* Button skeleton */}
        <Skeleton className="h-9 w-28" />
      </CardFooter>
    </Card>
  );
};

export default CoachingSkeleton;
