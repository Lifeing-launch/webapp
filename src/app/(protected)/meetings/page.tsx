"use client";

import React, { useState } from "react";

import { DateRange } from "@/components/ui/custom/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingsTab } from "@/components/meetings/meetings-tab";
import PageBanner from "@/components/layout/page-banner";
import { useSectionColors } from "@/hooks/use-section-colors";

type TabKey = "current-month" | "next-month" | "calendar";

const BANNER_IMAGE = "/images/banners/meetings.png";

const tabs: { key: TabKey; label: string }[] = [
  { key: "current-month", label: "This month" },
  { key: "next-month", label: "Next month" },
  { key: "calendar", label: "Calendar view" },
];

const currentMonthDateRange = generateDateRange("current-month");
const nextMonthDateRange = generateDateRange("next-month");
const calendarDateRange = generateDateRange("calendar");

const MeetingsPage = () => {
  const [tab, setTab] = useState<TabKey>("current-month");
  const { colors } = useSectionColors();

  return (
    <div className="w-full h-full flex flex-col flex-1">
      <PageBanner
        title="My Meetings"
        className="mb-0 flex-shrink-0"
        backgroundImage={BANNER_IMAGE}
      />
      <main className="flex-1 p-4 overflow-y-auto">
        <Tabs defaultValue="all" value={tab} className="space-y-4 w-full">
          <TabsList>
            {tabs.map((tabItem) => (
              <TabsTrigger
                value={tabItem.key}
                key={tabItem.key}
                onClick={() => setTab(tabItem.key)}
                className="cursor-pointer data-[state=active]:text-white"
                style={
                  tab === tabItem.key
                    ? {
                        backgroundColor: colors.primary,
                        color: "white",
                      }
                    : {}
                }
              >
                {tabItem.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent
            value={"current-month"}
            key={"current-month"}
            className="space-y-4"
          >
            <MeetingsTab initialDateRange={currentMonthDateRange} />
          </TabsContent>
          <TabsContent
            value={"next-month"}
            key={"next-month"}
            className="space-y-4"
          >
            <MeetingsTab initialDateRange={nextMonthDateRange} />
          </TabsContent>
          <TabsContent
            value={"calendar"}
            key={"calendar"}
            className="space-y-4"
          >
            <MeetingsTab initialDateRange={calendarDateRange} showDatePicker />
          </TabsContent>
        </Tabs>{" "}
      </main>
    </div>
  );
};

export default MeetingsPage;

function generateDateRange(preset?: TabKey): DateRange {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let targetYear = currentYear;
  let targetMonth = currentMonth;

  if (preset === "next-month") {
    if (currentMonth === 11) {
      // December -> January of next year
      targetYear = currentYear + 1;
      targetMonth = 0;
    } else {
      targetMonth = currentMonth + 1;
    }
  }
  const startOfMonth = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  if (preset === "current-month") {
    // From today to the end of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { from: today, to: endOfMonth };
  }

  return { from: startOfMonth, to: endOfMonth };
}
