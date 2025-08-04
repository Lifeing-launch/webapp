"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import DrinkCard from "./drink-card";
import { format } from "date-fns";

import { DrinkEntryWithRelations } from "@/typing/drink-log";

interface CalendarViewProps {
  entries: DrinkEntryWithRelations[];
  onDelete: (id: string) => void;
}

export default function CalendarView({ entries, onDelete }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const getDatesWithEntries = () => {
    return entries.map((entry) => new Date(entry.drank_at).toDateString());
  };

  const getEntriesForDate = (date: Date) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.drank_at);
      return entryDate.toDateString() === date.toDateString();
    });
  };

  const datesWithEntries = getDatesWithEntries();
  const selectedDateEntries = selectedDate
    ? getEntriesForDate(selectedDate)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="p-4 lg:col-span-1">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md"
          modifiers={{
            hasEntry: (date) =>
              date ? datesWithEntries.includes(date.toDateString()) : false,
          }}
          modifiersClassNames={{
            hasEntry: "has-drink-entry",
          }}
          components={{
            Day: ({ date, ...props }) => {
              if (!date) return <button {...props} />;
              const hasEntry = datesWithEntries.includes(date.toDateString());
              return (
                <div className="relative">
                  <button {...props} />
                  {hasEntry && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              );
            },
          }}
        />
      </Card>

      <div className="space-y-4 lg:col-span-4">
        {selectedDate && (
          <>
            <h3 className="text-lg font-semibold">
              {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            {selectedDateEntries.length === 0 ? (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  No drinks logged on this date
                </p>
              </Card>
            ) : (
              selectedDateEntries.map((entry) => (
                <DrinkCard key={entry.id} entry={entry} onDelete={onDelete} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
