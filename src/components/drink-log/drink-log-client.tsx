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
          <div className="overflow-x-auto lg:overflow-visible w-full lg:w-auto">
            <TabsList className="flex w-max min-w-full lg:grid lg:w-full lg:max-w-lg lg:grid-cols-4 justify-start">
              <TabsTrigger value="week" className="whitespace-nowrap">
                This week
              </TabsTrigger>
              <TabsTrigger value="month" className="whitespace-nowrap">
                This month
              </TabsTrigger>
              <TabsTrigger value="year" className="whitespace-nowrap">
                This year
              </TabsTrigger>
              <TabsTrigger value="calendar" className="whitespace-nowrap">
                Calendar View
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
