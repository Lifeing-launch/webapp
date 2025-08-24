import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type ViewType = "day" | "week" | "month" | "year";

interface Goal {
  id: string;
  user_id: string;
  daily_goal: number;
  weekly_goal: number;
  monthly_goal: number;
  created_at: string;
  updated_at: string;
}

interface DrinkEntry {
  quantity: number;
  drank_at: string;
  volume_ml: number | null;
  drink_types:
    | {
        standard_volume_ml: number;
        alcohol_percentage: number;
      }
    | {
        standard_volume_ml: number;
        alcohol_percentage: number;
      }[];
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Get the date range based on the view type
function getDateRange(view: ViewType): DateRange {
  const now = new Date();
  const endDate = new Date(now);
  let startDate: Date;

  switch (view) {
    case "day":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "week":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      // Default to daily view
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}

// Get the goal limit based on the view type
function getGoalLimit(goals: Goal | null, view: ViewType): number {
  if (!goals) return 0;

  switch (view) {
    case "day":
      return goals.daily_goal;
    case "week":
      return goals.weekly_goal;
    case "month":
      return goals.monthly_goal;
    case "year":
      return goals.monthly_goal * 12;
    default:
      return goals.daily_goal;
  }
}

// Calculate the total number of drinks logged (excluding zero drinks)
function calculateDrinksLogged(entries: DrinkEntry[]): number {
  return entries
    .filter((entry) => entry.quantity > 0)
    .reduce((sum, entry) => sum + entry.quantity, 0);
}

// Calculate standard drinks based on alcohol content (excluding zero drinks)
function calculateStandardDrinks(entries: DrinkEntry[]): number {
  const standardDrinks = entries
    .filter((entry) => entry.quantity > 0)
    .reduce((sum, entry) => {
      const drinkType = Array.isArray(entry.drink_types)
        ? entry.drink_types[0]
        : entry.drink_types;

      const volume = entry.volume_ml || drinkType.standard_volume_ml;
      const alcoholPercentage = drinkType.alcohol_percentage;

      // Standard drink calculation: (volume in ml * alcohol%) / 1400
      const standardDrinksForEntry = (volume * alcoholPercentage) / 1400;

      return sum + standardDrinksForEntry * entry.quantity;
    }, 0);

  // Round to 2 decimal places
  return Math.round(standardDrinks * 100) / 100;
}

// Calculate remaining drinks based on goal
function calculateRemainingDrinks(
  goalLimit: number,
  drinksLogged: number
): number {
  return Math.max(0, Math.round(goalLimit - drinksLogged));
}

// Calculate streak of days without drinking (excluding zero drinks)
async function calculateStreak(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  goals: Goal | null
): Promise<number> {
  if (!goals) return 0;

  // Determine the reference date (when the streak should start counting)
  const referenceDate = new Date(
    goals.updated_at !== goals.created_at ? goals.updated_at : goals.created_at
  );

  // Get all entries since the reference date, excluding zero drinks
  const { data: entries } = await supabase
    .schema("drink_log")
    .from("entries")
    .select("drank_at, quantity")
    .eq("user_id", userId)
    .gt("quantity", 0) // Only get entries with actual drinks
    .gte("drank_at", referenceDate.toISOString())
    .order("drank_at", { ascending: false });

  if (!entries || entries.length === 0) {
    // No drinks since goal was created/updated
    const today = new Date();
    const daysSinceReference = Math.floor(
      (today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceReference;
  }

  // Find the most recent drink date
  const mostRecentDrinkDate = new Date(entries[0].drank_at);
  mostRecentDrinkDate.setHours(0, 0, 0, 0);

  // Calculate days since last drink
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysSinceLastDrink = Math.floor(
    (today.getTime() - mostRecentDrinkDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLastDrink;
}

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client and authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get view parameter from query string
    const searchParams = request.nextUrl.searchParams;
    const viewParam = searchParams.get("view") || "day";
    const view = viewParam as ViewType;

    // Fetch user's most recent goals
    const { data: goals } = await supabase
      .schema("drink_log")
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Calculate date range and goal limit
    const { startDate } = getDateRange(view);
    const goalLimit = getGoalLimit(goals, view);

    // Fetch entries for the specified period
    const { data: entries, error: entriesError } = await supabase
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

    if (entriesError) {
      console.error("Error fetching entries:", entriesError);
      return NextResponse.json(
        { error: "Failed to fetch drink entries" },
        { status: 500 }
      );
    }

    // Calculate statistics
    const drinksLogged = calculateDrinksLogged(entries || []);
    const standardDrinks = calculateStandardDrinks(entries || []);
    const remainingDrinks = calculateRemainingDrinks(goalLimit, drinksLogged);
    const currentStreak = await calculateStreak(supabase, user.id, goals);

    return NextResponse.json({
      drinksLogged,
      standardDrinks,
      remainingDrinks,
      currentStreak,
    });
  } catch (error) {
    console.error("Error in drink stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
