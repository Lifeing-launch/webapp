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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DrinkStats({ view: _, refreshKey }: DrinkStatsProps) {
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
        const response = await fetch(`/api/drink-log/stats?view=day`);

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
  }, [refreshKey]);

  if (isLoading) {
    return <div className="h-32 animate-pulse bg-muted rounded-lg" />;
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-0">
        {/* Drinks Logged */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 px-2 py-3 md:px-4 md:py-2 text-center md:text-left">
          <Wine className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground flex-shrink-0 mx-auto md:mx-0" />
          <div className="space-y-1 md:space-y-0">
            <p className="text-xs md:text-sm text-muted-foreground leading-tight">
              Drinks
              <br className="md:hidden" /> Logged
            </p>
            <p className="text-xl md:text-2xl font-bold">
              {stats.drinksLogged}
            </p>
          </div>
        </div>

        {/* Standard Drinks Equivalent */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 px-2 py-3 md:px-4 md:py-2 md:border-l md:border-border text-center md:text-left">
          <GlassWater className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground flex-shrink-0 mx-auto md:mx-0" />
          <div className="space-y-1 md:space-y-0">
            <p className="text-xs md:text-sm text-muted-foreground leading-tight">
              Standard
              <br className="md:hidden" /> Drinks
              <br className="md:hidden" /> Equivalent
            </p>
            <p className="text-xl md:text-2xl font-bold">
              <span className="block md:inline">
                {stats.standardDrinks.toFixed(2)}
              </span>
              <span className="text-sm md:text-xl block md:inline"> units</span>
            </p>
          </div>
        </div>

        {/* Remaining Drinks */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 px-2 py-3 md:px-4 md:py-2 md:border-l md:border-border text-center md:text-left border-t md:border-t-0 border-border">
          <Martini className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground flex-shrink-0 mx-auto md:mx-0" />
          <div className="space-y-1 md:space-y-0">
            <p className="text-xs md:text-sm text-muted-foreground leading-tight">
              Remaining
              <br className="md:hidden" /> Drinks
            </p>
            <p className="text-xl md:text-2xl font-bold">
              <span className="block md:inline">{stats.remainingDrinks}</span>
              <span className="text-sm md:text-xl block md:inline">
                {" "}
                drinks
              </span>
            </p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 px-2 py-3 md:px-4 md:py-2 md:border-l md:border-border text-center md:text-left border-t md:border-t-0 border-border">
          <Goal className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground flex-shrink-0 mx-auto md:mx-0" />
          <div className="space-y-1 md:space-y-0">
            <p className="text-xs md:text-sm text-muted-foreground leading-tight">
              Current
              <br className="md:hidden" /> Streak
            </p>
            <p className="text-xl md:text-2xl font-bold">
              <span className="block md:inline">{stats.currentStreak}</span>
              <span className="text-sm md:text-xl block md:inline"> days</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
