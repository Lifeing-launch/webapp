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

    // Get entries for the period with drink type details
    const { data: entries } = await supabase
      .schema("drink_log")
      .from("entries")
      .select(
        `
        quantity, 
        drank_at, 
        volume_ml,
        drink_types!inner(
          standard_volume_ml,
          alcohol_percentage
        )
      `
      )
      .eq("user_id", user.id)
      .gte("drank_at", startDate.toISOString())
      .order("drank_at", { ascending: false });

    // Calculate stats
    const drinksLogged =
      entries?.reduce((sum, entry) => sum + entry.quantity, 0) || 0;

    // Calculate standard drinks based on actual volume and alcohol content
    const standardDrinks =
      entries?.reduce((sum, entry) => {
        const drinkType = Array.isArray(entry.drink_types)
          ? entry.drink_types[0]
          : entry.drink_types;

        const volume = entry.volume_ml || drinkType.standard_volume_ml;
        const alcoholPercentage = drinkType.alcohol_percentage;
        const standardDrinksForEntry =
          (volume * alcoholPercentage) / (14 * 100);

        return sum + standardDrinksForEntry * entry.quantity;
      }, 0) || 0;

    // Round standard drinks to 2 decimal places
    const roundedStandardDrinks = Math.round(standardDrinks * 100) / 100;

    // Round remaining drinks to whole numbers (no partial drinks)
    const remainingDrinks = Math.max(0, Math.round(goalLimit - drinksLogged));

    // Calculate streak (consecutive days without drinking)
    const { data: allEntries } = await supabase
      .schema("drink_log")
      .from("entries")
      .select("drank_at")
      .eq("user_id", user.id)
      .order("drank_at", { ascending: false })
      .limit(100); // Get more entries to calculate streak properly

    let currentStreak = 0;
    if (allEntries && allEntries.length > 0) {
      // Get unique dates when user drank
      const drinkDates = [
        ...new Set(
          allEntries.map((entry) => new Date(entry.drank_at).toDateString())
        ),
      ]
        .sort()
        .reverse();

      // Calculate consecutive days without drinking
      const today = new Date().toDateString();
      const currentDate = new Date();
      let streakDays = 0;

      while (true) {
        const dateString = currentDate.toDateString();

        // If we've found a day when user drank, break the streak
        if (drinkDates.includes(dateString)) {
          break;
        }

        // If we're past today, don't count future days
        if (dateString === today) {
          break;
        }

        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      currentStreak = streakDays;
    }

    return NextResponse.json({
      drinksLogged,
      standardDrinks: roundedStandardDrinks,
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
