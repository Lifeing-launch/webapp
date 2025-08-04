import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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
      .from("goals_history")
      .select(
        `
        *,
        goal:goals(id, user_id, created_at)
      `
      )
      .order("changed_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter to only show history for current user's goals
    const userHistory = data?.filter(
      (history) => history.goal?.user_id === user.id
    );

    return NextResponse.json(userHistory || []);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
