import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get("view") || "week";

    // Get most recent goals
    const { data: goals } = await supabase
      .schema("drink_log")
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Calculate date range based on view
    const now = new Date();
    let startDate: Date;
    let goalLimit: number = 0;

    if (view === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      goalLimit = goals?.weekly_goal || 0;
    } else if (view === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      goalLimit = goals?.monthly_goal || 0;
    } else if (view === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
      goalLimit = goals?.monthly_goal ? goals.monthly_goal * 12 : 0;
    } else {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      goalLimit = goals?.daily_goal || 0;
    }

    // Get entries for the period
    const { data: entries } = await supabase
      .schema("drink_log")
      .from("entries")
      .select("quantity, drank_at")
      .eq("user_id", user.id)
      .gte("drank_at", startDate.toISOString())
      .order("drank_at", { ascending: false });

    // Calculate stats
    const drinksLogged =
      entries?.reduce((sum, entry) => sum + entry.quantity, 0) || 0;
    const standardDrinks = Math.round(drinksLogged * 1.5); // Simplified conversion
    const remainingDrinks = Math.max(0, goalLimit - drinksLogged);

    // Calculate streak (days without drinking)
    const { data: allEntries } = await supabase
      .schema("drink_log")
      .from("entries")
      .select("drank_at")
      .eq("user_id", user.id)
      .order("drank_at", { ascending: false })
      .limit(30);

    let currentStreak = 0;
    if (allEntries && allEntries.length > 0) {
      const lastDrinkDate = new Date(allEntries[0].drank_at);
      const daysSinceLastDrink = Math.floor(
        (now.getTime() - lastDrinkDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      currentStreak = daysSinceLastDrink;
    }

    return NextResponse.json({
      drinksLogged,
      standardDrinks,
      remainingDrinks,
      currentStreak,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
