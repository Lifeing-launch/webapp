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
    <Card className="p-4 lg:p-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-0">
        {/* Drinks Logged */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 px-2 py-3 lg:px-4 lg:py-2 text-center lg:text-left">
          <Wine className="h-5 w-5 lg:h-6 lg:w-6 text-muted-foreground flex-shrink-0 mx-auto lg:mx-0" />
          <div className="space-y-1 lg:space-y-0">
            <p className="text-xs lg:text-sm text-muted-foreground leading-tight">
              Drinks
              <br className="lg:hidden" /> Logged
            </p>
            <p className="text-xl lg:text-2xl font-bold">
              {stats.drinksLogged}
            </p>
          </div>
        </div>

        {/* Standard Drinks Equivalent */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 px-2 py-3 lg:px-4 lg:py-2 lg:border-l lg:border-border text-center lg:text-left">
          <GlassWater className="h-5 w-5 lg:h-6 lg:w-6 text-muted-foreground flex-shrink-0 mx-auto lg:mx-0" />
          <div className="space-y-1 lg:space-y-0">
            <p className="text-xs lg:text-sm text-muted-foreground leading-tight">
              Standard
              <br className="lg:hidden" /> Drinks
              <br className="lg:hidden" /> Equivalent
            </p>
            <p className="text-xl lg:text-2xl font-bold">
              <span className="block lg:inline">
                {stats.standardDrinks.toFixed(2)}
              </span>
              <span className="text-sm lg:text-xl block lg:inline"> units</span>
            </p>
          </div>
        </div>

        {/* Remaining Drinks */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 px-2 py-3 lg:px-4 lg:py-2 lg:border-l lg:border-border text-center lg:text-left border-t lg:border-t-0 border-border">
          <Martini className="h-5 w-5 lg:h-6 lg:w-6 text-muted-foreground flex-shrink-0 mx-auto lg:mx-0" />
          <div className="space-y-1 lg:space-y-0">
            <p className="text-xs lg:text-sm text-muted-foreground leading-tight">
              Remaining
              <br className="lg:hidden" /> Drinks
            </p>
            <p className="text-xl lg:text-2xl font-bold">
              <span className="block lg:inline">{stats.remainingDrinks}</span>
              <span className="text-sm lg:text-xl block lg:inline">
                {" "}
                drinks
              </span>
            </p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 px-2 py-3 lg:px-4 lg:py-2 lg:border-l lg:border-border text-center lg:text-left border-t lg:border-t-0 border-border">
          <Goal className="h-5 w-5 lg:h-6 lg:w-6 text-muted-foreground flex-shrink-0 mx-auto lg:mx-0" />
          <div className="space-y-1 lg:space-y-0">
            <p className="text-xs lg:text-sm text-muted-foreground leading-tight">
              Current
              <br className="lg:hidden" /> Streak
            </p>
            <p className="text-xl lg:text-2xl font-bold">
              <span className="block lg:inline">{stats.currentStreak}</span>
              <span className="text-sm lg:text-xl block lg:inline"> days</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
