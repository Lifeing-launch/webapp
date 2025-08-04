"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense, useState, useCallback } from "react";
import DrinkLogList from "./drink-log-list";
import DrinkLogHeader from "./drink-log-header";
import DrinkStats from "./drink-stats";

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
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="week">This week</TabsTrigger>
          <TabsTrigger value="month">This month</TabsTrigger>
          <TabsTrigger value="year">This year</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

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
