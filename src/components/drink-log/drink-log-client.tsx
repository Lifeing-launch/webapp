"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense, useState, useCallback } from "react";
import DrinkLogList from "./drink-log-list";
import DrinkLogHeader from "./drink-log-header";
import DrinkStats from "./drink-stats";
import DrinkAchievements from "./drink-achievements";

interface DrinkLogClientProps {
  userId: string;
  initialView: string;
}

export default function DrinkLogClient({
  userId,
  initialView,
}: DrinkLogClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataChange = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <DrinkLogHeader onDataChange={handleDataChange} />

      <DrinkStats userId={userId} view={initialView} refreshKey={refreshKey} />

      <Tabs defaultValue={initialView} className="w-full">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center lg:justify-between">
          <div className="w-full lg:w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:max-w-lg gap-1 h-auto p-1">
              <TabsTrigger
                value="week"
                className="text-xs sm:text-sm px-2 py-3 sm:py-1 h-auto min-w-24"
              >
                Week
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="text-xs sm:text-sm px-2 py-3 sm:py-1 h-auto min-w-24"
              >
                Month
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="text-xs sm:text-sm px-2 py-3 sm:py-1 h-auto min-w-24"
              >
                Year
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="text-xs sm:text-sm px-2 py-3 sm:py-1 h-auto min-w-24"
              >
                Calendar
              </TabsTrigger>
            </TabsList>
          </div>
          <DrinkAchievements refreshKey={refreshKey} />
        </div>

        <TabsContent value="week" className="mt-6">
          <Suspense
            fallback={
              <div className="h-96 animate-pulse bg-muted rounded-lg" />
            }
          >
            <DrinkLogList
              key={`week-${refreshKey}`}
              userId={userId}
              view="week"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="month" className="mt-6">
          <Suspense
            fallback={
              <div className="h-96 animate-pulse bg-muted rounded-lg" />
            }
          >
            <DrinkLogList
              key={`month-${refreshKey}`}
              userId={userId}
              view="month"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="year" className="mt-6">
          <Suspense
            fallback={
              <div className="h-96 animate-pulse bg-muted rounded-lg" />
            }
          >
            <DrinkLogList
              key={`year-${refreshKey}`}
              userId={userId}
              view="year"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Suspense
            fallback={
              <div className="h-96 animate-pulse bg-muted rounded-lg" />
            }
          >
            <DrinkLogList
              key={`calendar-${refreshKey}`}
              userId={userId}
              view="calendar"
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
