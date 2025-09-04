"use client";

import { useCallback, useEffect, useState } from "react";
import DrinkCard from "./drink-card";
import CalendarView from "./calendar-view";
import { useRouter } from "next/navigation";
import { DrinkEntryWithRelations } from "@/typing/drink-log";
import { toast } from "sonner";

interface DrinkLogListProps {
  userId: string;
  view: string;
}

export default function DrinkLogList({ view }: DrinkLogListProps) {
  const router = useRouter();
  const [entries, setEntries] = useState<DrinkEntryWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch(`/api/drink-log/entries?view=${view}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setIsLoading(false);
    }
  }, [view]);

  useEffect(() => {
    // Don't fetch entries for calendar view here
    if (view !== "calendar") {
      fetchEntries();
    } else {
      setIsLoading(false);
    }
  }, [fetchEntries, view]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/drink-log/entries?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEntries(entries.filter((entry) => entry.id !== id));
        router.refresh();
        toast.success("Drink entry deleted");
      } else {
        toast.error("Failed to delete drink entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete drink entry");
    }
  };

  if (isLoading) {
    return <div className="h-96 animate-pulse bg-muted rounded-lg" />;
  }

  if (view === "calendar") {
    return <CalendarView onDelete={handleDelete} />;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No drinks logged yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {entries.map((entry) => (
        <DrinkCard key={entry.id} entry={entry} onDelete={handleDelete} />
      ))}
    </div>
  );
}
