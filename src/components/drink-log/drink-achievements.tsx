"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trophy, TrendingDown, Calendar, Target } from "lucide-react";
import { AchievementResponse } from "@/typing/drink-log";
import { toast } from "sonner";
import Image from "next/image";

interface DrinkAchievementsProps {
  refreshKey?: number;
}

export default function DrinkAchievements({
  refreshKey = 0,
}: DrinkAchievementsProps) {
  const hasShownToast = useRef(false);

  const query = useQuery<AchievementResponse[]>({
    queryKey: ["drink-achievements", refreshKey],
    queryFn: async () => {
      const response = await fetch("/api/drink-log/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Default to last 180 days
      });
      if (!response.ok) throw new Error("Failed to fetch achievements");
      return (await response.json()) as AchievementResponse[];
    },
    staleTime: 60 * 1000,
  });

  // Compute newly awarded toasts in a clean, unobtrusive way
  const newlyAwarded = useMemo(
    () => (query.data ?? []).filter((a) => a.stats.is_new),
    [query.data]
  );

  useEffect(() => {
    if (!hasShownToast.current && newlyAwarded.length > 0) {
      hasShownToast.current = true;

      if (newlyAwarded.length === 1) {
        const a = newlyAwarded[0];
        toast(
          <div className="flex items-center gap-2">
            {getBadgeIcon(a.badge.code)}
            <span className="text-sm">New achievement: {a.badge.name}</span>
          </div>,
          { duration: 4500 }
        );
      } else {
        const names = newlyAwarded.map((a) => a.badge.name).join(", ");
        toast(
          <div className="text-sm">
            {newlyAwarded.length} new achievements: {names}
          </div>,
          { duration: 5500 }
        );
      }
    }
  }, [newlyAwarded]);

  // Helper function to get badge icon
  const getBadgeIcon = (code: string) => {
    switch (code) {
      case "alcohol_free_period":
        return <TrendingDown className="h-5 w-5 text-purple-600" />;
      case "daily_target":
        return <Target className="h-5 w-5 text-green-600" />;
      case "weekly_target":
        return <Calendar className="h-5 w-5 text-orange-600" />;
      case "monthly_target":
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      default:
        return <Trophy className="h-5 w-5 text-blue-600" />;
    }
  };

  const formatLastEarned = (date: string | null) => {
    if (!date) return "Not earned yet";
    const earned = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - earned.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return earned.toLocaleDateString();
  };

  // Only show achievements the user has already earned at least once
  const visibleAchievements = useMemo(() => {
    const achievements = query.data ?? [];
    return achievements.filter(
      (a) => a.stats.total_earned > 0 || !!a.stats.last_earned_at
    );
  }, [query.data]);

  if (query.isLoading) {
    return (
      <div className="flex items-center gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="size-10 rounded-full bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {visibleAchievements.map((achievement) => {
        const isNew = achievement.stats.is_new;
        return (
          <Tooltip key={achievement.badge.code}>
            <TooltipTrigger asChild>
              <div className="relative size-12 rounded-full flex items-center justify-center">
                {achievement.badge.icon_url ? (
                  <Image
                    src={achievement.badge.icon_url?.trimStart()}
                    alt={achievement.badge.name}
                    width={32}
                    height={32}
                    className="size-8 rounded-full object-contain"
                    unoptimized
                  />
                ) : (
                  getBadgeIcon(achievement.badge.code)
                )}

                {isNew && (
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary/40" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-60">
                <p className="font-medium text-xs">{achievement.badge.name}</p>
                {achievement.badge.description && (
                  <p className="mt-0.5 text-[11px] opacity-90">
                    {achievement.badge.description}
                  </p>
                )}
                <p className="mt-1 text-[11px] opacity-75">
                  {achievement.stats.total_earned} earned — last:{" "}
                  {formatLastEarned(achievement.stats.last_earned_at)}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
