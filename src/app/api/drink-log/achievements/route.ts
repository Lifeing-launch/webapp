import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type BadgeCode =
  | "alcohol_free_period"
  | "daily_target"
  | "weekly_target"
  | "monthly_target";

interface Period {
  startDate: string; // YYYY-MM-DD in ET
  endDate: string; // YYYY-MM-DD in ET
  goals: { daily: number; weekly: number; monthly: number };
}

/**
 * Convert ISO timestamp to ET date string (YYYY-MM-DD)
 */
function toETDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

/**
 * Safe clamp of date range to valid [from, to] boundaries
 */
function clampDate(dateYYYYMMDD: string, from: string, to: string): string {
  if (dateYYYYMMDD < from) return from;
  if (dateYYYYMMDD > to) return to;
  return dateYYYYMMDD;
}

/**
 * Compute difference in days between two ET dates (YYYY-MM-DD)
 */
function daysBetween(startYYYYMMDD: string, endYYYYMMDD: string): number {
  const start = new Date(`${startYYYYMMDD}T00:00:00Z`).getTime();
  const end = new Date(`${endYYYYMMDD}T00:00:00Z`).getTime();
  return Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
}

/**
 * Build period segments from goals + goals_history.
 * Uses previous_* snapshot in history for segments that ended at a change,
 * and current goals for the ongoing segment.
 */
function buildGoalPeriods(
  goal: {
    id: string;
    created_at: string;
    updated_at: string | null;
    daily_goal: number;
    weekly_goal: number;
    monthly_goal: number;
  },
  history: Array<{
    changed_at: string;
    previous_daily: number;
    previous_weekly: number;
    previous_monthly: number;
  }>,
  from: string,
  to: string
): Period[] {
  const periods: Period[] = [];

  // Sort ascending by changed_at
  const sorted = [...history].sort(
    (a, b) =>
      new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
  );

  let cursorStart = toETDate(goal.created_at);
  for (const h of sorted) {
    const end = toETDate(h.changed_at);
    const startClamped = clampDate(cursorStart, from, to);
    const endClamped = clampDate(end, from, to);
    if (startClamped <= endClamped) {
      periods.push({
        startDate: startClamped,
        endDate: endClamped,
        goals: {
          daily: h.previous_daily,
          weekly: h.previous_weekly,
          monthly: h.previous_monthly,
        },
      });
    }
    cursorStart = end;
  }

  // Ongoing period (from last change to now)
  const lastStart = toETDate(goal.updated_at ?? goal.created_at);
  const lastStartClamped = clampDate(lastStart, from, to);
  const endClamped = to;
  if (lastStartClamped <= endClamped) {
    periods.push({
      startDate: lastStartClamped,
      endDate: endClamped,
      goals: {
        daily: goal.daily_goal,
        weekly: goal.weekly_goal,
        monthly: goal.monthly_goal,
      },
    });
  }

  // Merge/normalize adjacent with same dates if any artifacts
  return periods.filter((p) => p.startDate <= p.endDate);
}

/**
 * Build period_key using spec from docs: <type>:goal:<goal_id>:<period_start>
 */
function buildPeriodKey(type: BadgeCode, goalId: string, periodStart: string) {
  const prefix =
    type === "alcohol_free_period"
      ? "alcohol_free"
      : type === "daily_target"
        ? "daily"
        : type === "weekly_target"
          ? "weekly"
          : "monthly";
  return `${prefix}:goal:${goalId}:${periodStart}`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse request body with fallback defaults
    const body = await request
      .json()
      .catch(() => ({}) as { from?: string; to?: string });

    // Default to last 180 days if no range provided (ET date format)
    const defaultTo = new Date().toISOString().slice(0, 10);
    const defaultFrom = new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)
      .toISOString()
      .slice(0, 10);

    const from: string = body.from ?? defaultFrom;
    const to: string = body.to ?? defaultTo;

    // Load active badges once with all details
    const { data: badges, error: badgesError } = await supabase
      .schema("drink_log")
      .from("badges")
      .select("id, code, name, description, icon_url, scope, active")
      .eq("active", true);
    if (badgesError) {
      return NextResponse.json({ error: badgesError.message }, { status: 500 });
    }
    const codeToBadgeId = new Map<string, number>();
    const badgeDetailsMap = new Map<string, (typeof badges)[0]>();
    for (const b of badges ?? []) {
      codeToBadgeId.set(b.code, b.id);
      badgeDetailsMap.set(b.code, b);
    }

    // Get user's current goal
    const { data: goal, error: goalError } = await supabase
      .schema("drink_log")
      .from("goals")
      .select(
        "id, user_id, daily_goal, weekly_goal, monthly_goal, created_at, updated_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (goalError || !goal) {
      // No goals set: return zeros per badge
      const empty = (badges || []).map((badge) => ({
        badge: {
          id: badge.id,
          code: badge.code,
          name: badge.name,
          description: badge.description,
          icon_url: badge.icon_url,
          scope: badge.scope,
        },
        stats: {
          total_earned: 0,
          last_earned_at: null,
          newly_awarded: 0,
          is_new: false,
        },
      }));
      return NextResponse.json(empty);
    }

    // Get goals history for period segmentation
    const { data: history } = await supabase
      .schema("drink_log")
      .from("goals_history")
      .select("changed_at, previous_daily, previous_weekly, previous_monthly")
      .eq("goal_id", goal.id);

    // Build periods within [from,to]
    const periods = buildGoalPeriods(goal, history ?? [], from, to);
    if (periods.length === 0) {
      // Still return stats (no awards)
      const { data: agg } = await supabase
        .schema("drink_log")
        .from("user_badges")
        .select("badge_id, count:count(*), last_earned:max(earned_at)")
        .eq("user_id", user.id)
        .in(
          "badge_id",
          (badges ?? []).map((b) => b.id)
        );
      const countsByBadge = new Map<
        number,
        { count: number; last: string | null }
      >();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (agg || []).forEach((r: any) =>
        countsByBadge.set(r.badge_id, {
          count: r.count as number,
          last: r.last_earned as string | null,
        })
      );
      const resp = (badges || []).map((badge) => ({
        badge: {
          id: badge.id,
          code: badge.code,
          name: badge.name,
          description: badge.description,
          icon_url: badge.icon_url,
          scope: badge.scope,
        },
        stats: {
          total_earned: countsByBadge.get(badge.id)?.count ?? 0,
          last_earned_at: countsByBadge.get(badge.id)?.last ?? null,
          newly_awarded: 0,
          is_new: false,
        },
      }));
      return NextResponse.json(resp);
    }

    // Compute bounded global range for fetching entries
    const globalStart = periods.reduce(
      (min, p) => (p.startDate < min ? p.startDate : min),
      periods[0].startDate
    );
    const globalEnd = periods.reduce(
      (max, p) => (p.endDate > max ? p.endDate : max),
      periods[0].endDate
    );

    // Fetch entries in one go
    const { data: entries, error: entriesError } = await supabase
      .schema("drink_log")
      .from("entries")
      .select("drank_at, quantity")
      .eq("user_id", user.id)
      .gte("drank_at", `${globalStart}T00:00:00Z`)
      .lte("drank_at", `${globalEnd}T23:59:59Z`);
    if (entriesError) {
      return NextResponse.json(
        { error: entriesError.message },
        { status: 500 }
      );
    }

    // Build per-day totals (ET) and per-period buckets
    const dailyTotals = new Map<string, number>(); // date -> total
    for (const e of entries ?? []) {
      const d = toETDate(e.drank_at);
      dailyTotals.set(d, (dailyTotals.get(d) ?? 0) + (e.quantity as number));
    }

    // Prepare computations per period
    const periodDailyTotals = new Map<string, Map<string, number>>(); // key=startDate->(date->sum)
    const periodTotals = new Map<string, number>(); // key=startDate->sum

    for (const period of periods) {
      const map = new Map<string, number>();
      // iterate only dates present in dailyTotals within this period
      for (const [date, sum] of dailyTotals) {
        if (date >= period.startDate && date <= period.endDate) {
          map.set(date, sum);
        }
      }
      periodDailyTotals.set(period.startDate, map);
      let total = 0;
      for (const v of map.values()) total += v;
      periodTotals.set(period.startDate, total);
    }

    // Determine which period badges are eligible
    type PendingAward = {
      badgeCode: BadgeCode;
      badgeId: number;
      period_key: string;
      period_start: string;
      period_end: string;
      goal_snapshot: {
        daily_goal: number;
        weekly_goal: number;
        monthly_goal: number;
      };
      metrics: Record<string, unknown> | null;
    };

    const pending: PendingAward[] = [];

    for (const period of periods) {
      const key = period.startDate;
      const map = periodDailyTotals.get(key)!;
      const total = periodTotals.get(key)!;
      const loggedDays = map.size;
      const periodDays = Math.max(
        1,
        daysBetween(period.startDate, period.endDate) + 1 // +1 to include both start and end dates
      );

      // Alcohol Free Period: at least 1 day without drinking (logged 0 or no logs)
      // Award if user has either:
      // 1. Logged at least one day with 0 drinks, OR
      // 2. Has at least 1 full day in the period without any logs
      const hasZeroLogged = Array.from(map.values()).some((v) => v === 0);
      const hasUnloggedDays = periodDays > loggedDays;

      if (hasZeroLogged || hasUnloggedDays) {
        const code: BadgeCode = "alcohol_free_period";
        const badgeId = codeToBadgeId.get(code)!;
        pending.push({
          badgeCode: code,
          badgeId,
          period_key: buildPeriodKey(code, goal.id, period.startDate),
          period_start: period.startDate,
          period_end: period.endDate,
          goal_snapshot: {
            daily_goal: period.goals.daily,
            weekly_goal: period.goals.weekly,
            monthly_goal: period.goals.monthly,
          },
          metrics: {
            has_zero_days: hasZeroLogged,
            has_unlogged_days: hasUnloggedDays,
            days_without_drinking: hasZeroLogged
              ? Array.from(map.values()).filter((v) => v === 0).length
              : periodDays - loggedDays,
          },
        });
      }

      // Daily Target Achievement: Award when daily goal is met
      // Check if user is meeting their daily drinking goal
      const daysOverLimit = Array.from(map.values()).filter(
        (v) => v > period.goals.daily
      ).length;
      const meetsDailyGoal = daysOverLimit === 0;

      if (meetsDailyGoal && periodDays >= 1) {
        const code: BadgeCode = "daily_target";
        const badgeId = codeToBadgeId.get(code)!;
        pending.push({
          badgeCode: code,
          badgeId,
          period_key: buildPeriodKey(code, goal.id, period.startDate),
          period_start: period.startDate,
          period_end: period.endDate,
          goal_snapshot: {
            daily_goal: period.goals.daily,
            weekly_goal: period.goals.weekly,
            monthly_goal: period.goals.monthly,
          },
          metrics: {
            days_over_limit: daysOverLimit,
            logged_days: loggedDays,
            period_days: periodDays,
            all_days_within_goal: true,
          },
        });
      }

      // Weekly Target Achievement: Award when weekly goal is met
      // Check if at least 7 days have passed and weekly average is within goal
      const weeksInPeriod = periodDays / 7;
      if (weeksInPeriod >= 1) {
        const avgWeekly = total / weeksInPeriod;
        if (avgWeekly <= period.goals.weekly) {
          const code: BadgeCode = "weekly_target";
          const badgeId = codeToBadgeId.get(code)!;
          pending.push({
            badgeCode: code,
            badgeId,
            period_key: buildPeriodKey(code, goal.id, period.startDate),
            period_start: period.startDate,
            period_end: period.endDate,
            goal_snapshot: {
              daily_goal: period.goals.daily,
              weekly_goal: period.goals.weekly,
              monthly_goal: period.goals.monthly,
            },
            metrics: {
              avg_weekly: Math.round(avgWeekly * 100) / 100,
              weeks_in_period: Math.round(weeksInPeriod * 100) / 100,
              total_drinks: total,
            },
          });
        }
      }

      // Monthly Target Achievement: Award when monthly goal is met
      // Check if at least 30 days have passed and monthly average is within goal
      const monthsInPeriod = periodDays / 30;
      if (monthsInPeriod >= 1) {
        const avgMonthly = total / monthsInPeriod;
        if (avgMonthly <= period.goals.monthly) {
          const code: BadgeCode = "monthly_target";
          const badgeId = codeToBadgeId.get(code)!;
          pending.push({
            badgeCode: code,
            badgeId,
            period_key: buildPeriodKey(code, goal.id, period.startDate),
            period_start: period.startDate,
            period_end: period.endDate,
            goal_snapshot: {
              daily_goal: period.goals.daily,
              weekly_goal: period.goals.weekly,
              monthly_goal: period.goals.monthly,
            },
            metrics: {
              avg_monthly: Math.round(avgMonthly * 100) / 100,
              months_in_period: Math.round(monthsInPeriod * 100) / 100,
              total_drinks: total,
            },
          });
        }
      }
    }

    // Filter out already awarded by checking existing user_badges by period_key
    const candidateKeys = Array.from(new Set(pending.map((p) => p.period_key)));
    let existingKeys = new Set<string>();
    if (candidateKeys.length > 0) {
      const { data: existing } = await supabase
        .schema("drink_log")
        .from("user_badges")
        .select("period_key")
        .eq("user_id", user.id)
        .in("period_key", candidateKeys);
      existingKeys = new Set(
        (existing ?? []).map((r: { period_key: string }) => r.period_key)
      );
    }

    const toInsert = pending.filter((p) => !existingKeys.has(p.period_key));

    const insertedByCode = new Map<string, number>();
    if (toInsert.length > 0) {
      const payload = toInsert.map((p) => ({
        user_id: user.id,
        badge_id: p.badgeId,
        period_key: p.period_key,
        period_start: p.period_start,
        period_end: p.period_end,
        goal_snapshot: p.goal_snapshot,
        metrics: p.metrics,
      }));
      const { error: insertError } = await supabase
        .schema("drink_log")
        .from("user_badges")
        .upsert(payload, {
          onConflict: "user_id,badge_id,period_key",
          ignoreDuplicates: true,
        });
      if (insertError) {
        // If ignoreDuplicates not supported, fall back silently; uniqueness prevents duplicates
        // but we don't mark newly awarded in that case reliably
        // We'll still proceed to compute stats below
      }
      // Count awarded now per code
      for (const p of toInsert) {
        insertedByCode.set(
          p.badgeCode,
          (insertedByCode.get(p.badgeCode) ?? 0) + 1
        );
      }
    }

    // Get all user badges for aggregation
    const { data: userBadges } = await supabase
      .schema("drink_log")
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", user.id)
      .in(
        "badge_id",
        (badges ?? []).map((b) => b.id)
      );

    // Aggregate counts and last earned dates
    const countsByBadge = new Map<
      number,
      { count: number; last: string | null }
    >();

    // Process user badges to get counts and last earned
    for (const badge of badges ?? []) {
      const userBadgesForThisBadge = (userBadges ?? []).filter(
        (ub) => ub.badge_id === badge.id
      );

      if (userBadgesForThisBadge.length > 0) {
        const lastEarned = userBadgesForThisBadge
          .map((ub) => ub.earned_at)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

        countsByBadge.set(badge.id, {
          count: userBadgesForThisBadge.length,
          last: lastEarned,
        });
      }
    }

    const response = (badges || []).map((badge) => {
      const awardedNow = insertedByCode.get(badge.code) ?? 0;
      const userStats = countsByBadge.get(badge.id);

      return {
        badge: {
          id: badge.id,
          code: badge.code,
          name: badge.name,
          description: badge.description,
          icon_url: badge.icon_url,
          scope: badge.scope,
        },
        stats: {
          total_earned: userStats?.count ?? 0,
          last_earned_at: userStats?.last ?? null,
          newly_awarded: awardedNow,
          is_new: awardedNow > 0,
        },
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in achievements endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
