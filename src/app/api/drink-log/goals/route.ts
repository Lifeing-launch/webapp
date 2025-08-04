import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .schema("drink_log")
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code === "PGRST116") {
      return NextResponse.json(null);
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if user already has goals
    const { data: existingGoal } = await supabase
      .schema("drink_log")
      .from("goals")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingGoal) {
      // Update existing goal
      const { data, error } = await supabase
        .schema("drink_log")
        .from("goals")
        .update({
          daily_goal: body.daily_goal,
          weekly_goal: body.weekly_goal,
          monthly_goal: body.monthly_goal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingGoal.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    } else {
      // Create new goal
      const { data, error } = await supabase
        .schema("drink_log")
        .from("goals")
        .insert({
          user_id: user.id,
          daily_goal: body.daily_goal,
          weekly_goal: body.weekly_goal,
          monthly_goal: body.monthly_goal,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get the most recent goal for this user
    const { data: latestGoal } = await supabase
      .schema("drink_log")
      .from("goals")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestGoal) {
      return NextResponse.json({ error: "No goals found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .schema("drink_log")
      .from("goals")
      .update({
        daily_goal: body.daily_goal,
        weekly_goal: body.weekly_goal,
        monthly_goal: body.monthly_goal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", latestGoal.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
