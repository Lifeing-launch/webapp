"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import DrinkCard from "./drink-card";
import { format } from "date-fns";
import { DrinkEntryWithRelations } from "@/typing/drink-log";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DayButton } from "react-day-picker";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  onDelete: (id: string) => void;
}

export default function CalendarView({ onDelete }: CalendarViewProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [monthEntries, setMonthEntries] = useState<DrinkEntryWithRelations[]>(
    []
  );
  const [selectedDateEntries, setSelectedDateEntries] = useState<
    DrinkEntryWithRelations[]
  >([]);
  const [isLoadingMonth, setIsLoadingMonth] = useState(true);
  const [isLoadingDay, setIsLoadingDay] = useState(false);

  // Fetch entries for the current month
  const fetchMonthEntries = useCallback(async (date: Date) => {
    setIsLoadingMonth(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const response = await fetch(
        `/api/drink-log/entries?view=calendar&year=${year}&month=${month}`
      );
      if (response.ok) {
        const data = await response.json();
        setMonthEntries(data);
      }
    } catch (error) {
      console.error("Error fetching month entries:", error);
    } finally {
      setIsLoadingMonth(false);
    }
  }, []);

  // Fetch entries for a specific date
  const fetchDateEntries = useCallback(async (date: Date) => {
    setIsLoadingDay(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await fetch(
        `/api/drink-log/entries?view=day&date=${formattedDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedDateEntries(data);
      }
    } catch (error) {
      console.error("Error fetching date entries:", error);
    } finally {
      setIsLoadingDay(false);
    }
  }, []);

  // Load month data when component mounts or month changes
  useEffect(() => {
    fetchMonthEntries(currentMonth);
  }, [currentMonth, fetchMonthEntries]);

  // Load selected date entries when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchDateEntries(selectedDate);
    }
  }, [selectedDate, fetchDateEntries]);

  // Get dates that have entries
  const getDatesWithEntries = () => {
    const datesMap = new Map<string, number>();
    monthEntries.forEach((entry) => {
      const dateKey = format(new Date(entry.drank_at), "yyyy-MM-dd");
      datesMap.set(dateKey, (datesMap.get(dateKey) || 0) + 1);
    });
    return datesMap;
  };

  const datesWithEntries = getDatesWithEntries();

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  const handleDeleteEntry = async (id: string) => {
    onDelete(id);
    // Refresh data after deletion
    fetchMonthEntries(currentMonth);
    if (selectedDate) {
      fetchDateEntries(selectedDate);
    }
    router.refresh();
  };

  // Custom DayButton component with dots
  const CustomDayButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof DayButton>
  >(({ className, day, modifiers, ...props }, ref) => {
    const dateKey = format(day.date, "yyyy-MM-dd");
    const entryCount = datesWithEntries.get(dateKey) || 0;
    const isSelected = modifiers.selected;

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn(
          "relative h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal text-xs sm:text-sm hover:bg-accent hover:text-accent-foreground",
          modifiers.today && "bg-accent text-accent-foreground",
          modifiers.selected &&
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          modifiers.outside && "text-muted-foreground opacity-50",
          modifiers.disabled && "text-muted-foreground opacity-50",
          className
        )}
        {...props}
      >
        <span>{day.date.getDate()}</span>
        {entryCount > 0 && (
          <div className="absolute -bottom-0.5 sm:-bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {Array.from({ length: Math.min(entryCount, 1) }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full",
                  isSelected ? "bg-primary-foreground" : "bg-primary"
                )}
              />
            ))}
          </div>
        )}
      </Button>
    );
  });
  CustomDayButton.displayName = "CustomDayButton";

  return (
    <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
      {/* Calendar Section */}
      <div className="xl:w-[25%] xl:flex-shrink-0">
        <Card className="p-3 sm:p-4 w-full xl:sticky xl:top-4">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={handleMonthChange}
              className="rounded-md w-fit xl:w-full"
              disabled={isLoadingMonth}
              components={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                DayButton: CustomDayButton as any,
              }}
            />
          </div>
        </Card>
      </div>

      {/* Selected Date Entries Section */}
      <div className="xl:flex-1 xl:min-w-0">
        {selectedDate && (
          <div className="space-y-3 sm:space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold">
                {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              {selectedDateEntries.length > 0 && (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {selectedDateEntries.length} drink
                  {selectedDateEntries.length !== 1 ? "s" : ""} logged
                </span>
              )}
            </div>

            {isLoadingDay ? (
              <Card className="p-4 sm:p-6">
                <div className="h-20 sm:h-24 animate-pulse bg-muted rounded-lg" />
              </Card>
            ) : selectedDateEntries.length === 0 ? (
              <Card className="p-4 sm:p-6">
                <div className="text-center">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    No drinks logged on this date
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
                {selectedDateEntries.map((entry) => (
                  <DrinkCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDeleteEntry}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
