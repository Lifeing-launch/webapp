"use client";

import { Card } from "@/components/ui/card";
import { Wine, GlassWater, Martini, Goal } from "lucide-react";
import { useEffect, useState } from "react";

interface DrinkStatsProps {
  userId: string;
  view: string;
  refreshKey?: number;
}

interface Stats {
  drinksLogged: number;
  standardDrinks: number;
  remainingDrinks: number;
  currentStreak: number;
}

export default function DrinkStats({ view, refreshKey }: DrinkStatsProps) {
  const [stats, setStats] = useState<Stats>({
    drinksLogged: 0,
    standardDrinks: 0,
    remainingDrinks: 0,
    currentStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/drink-log/stats?view=${view}`);

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getStats();
  }, [view, refreshKey]);

  if (isLoading) {
    return <div className="h-32 animate-pulse bg-muted rounded-lg" />;
  }

  return (
    <Card className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {/* Drinks Logged */}
        <div className="flex items-center gap-3 px-4 py-2">
          <Wine className="h-6 w-6 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Drinks Logged</p>
            <p className="text-2xl font-bold">{stats.drinksLogged}</p>
          </div>
        </div>

        {/* Standard Drinks Equivalent */}
        <div className="flex items-center gap-3 px-4 py-2 md:border-l md:border-border">
          <GlassWater className="h-6 w-6 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">
              Standard Drinks Equivalent
            </p>
            <p className="text-2xl font-bold">
              {stats.standardDrinks.toFixed(2)} units
            </p>
          </div>
        </div>

        {/* Remaining Drinks */}
        <div className="flex items-center gap-3 px-4 py-2 md:border-l md:border-border">
          <Martini className="h-6 w-6 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Remaining Drinks</p>
            <p className="text-2xl font-bold">{stats.remainingDrinks} drinks</p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="flex items-center gap-3 px-4 py-2 md:border-l md:border-border">
          <Goal className="h-6 w-6 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-bold">{stats.currentStreak} days</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
