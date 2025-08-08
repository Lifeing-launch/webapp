import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all active badges from catalog
    const { data: badges, error: badgesError } = await supabase
      .schema("drink_log")
      .from("badges")
      .select("*")
      .eq("active", true)
      .order("name");

    if (badgesError) {
      console.error("Error fetching badges:", badgesError);
      return NextResponse.json({ error: badgesError.message }, { status: 500 });
    }

    // Get user achievement stats
    const { data: userBadges, error: userBadgesError } = await supabase
      .schema("drink_log")
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", user.id);

    if (userBadgesError) {
      console.error("Error fetching user badges:", userBadgesError);
      return NextResponse.json(
        { error: userBadgesError.message },
        { status: 500 }
      );
    }

    // Aggregate count and last earned for each badge
    const badgeStats = new Map<
      number,
      { count: number; last_earned: string | null }
    >();

    
    for (const userBadge of userBadges ?? []) {
      const existing = badgeStats.get(userBadge.badge_id) ?? {
        count: 0,
        last_earned: null,
      };

      
      badgeStats.set(userBadge.badge_id, {
        count: existing.count + 1,
        last_earned:
          !existing.last_earned || userBadge.earned_at > existing.last_earned
            ? userBadge.earned_at
            : existing.last_earned,
      });
    }

    // Combine badges with their stats
    const result = (badges ?? []).map((badge) => ({
      ...badge,
      stats: badgeStats.get(badge.id) ?? { count: 0, last_earned: null },
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Unexpected error in achievements endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}