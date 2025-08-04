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
    const date = searchParams.get("date");

    let query = supabase
      .schema("drink_log")
      .from("entries")
      .select(
        `
        *,
        drink_type:drink_types(id, name),
        drink_brand:drink_brands(id, name),
        mood:moods(id, name),
        trigger:triggers(id, name),
        location:locations(id, name)
      `
      )
      .eq("user_id", user.id)
      .order("drank_at", { ascending: false });

    const now = new Date();

    if (view === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      query = query.gte("drank_at", weekStart.toISOString());
    } else if (view === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      query = query.gte("drank_at", monthStart.toISOString());
    } else if (view === "year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      query = query.gte("drank_at", yearStart.toISOString());
    } else if (view === "day" && date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      query = query
        .gte("drank_at", dayStart.toISOString())
        .lte("drank_at", dayEnd.toISOString());
    }

    const { data, error } = await query;

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

    const { data, error } = await supabase
      .schema("drink_log")
      .from("entries")
      .insert({
        user_id: user.id,
        drank_at: body.drank_at,
        drink_type_id: body.drink_type_id,
        drink_brand_id: body.drink_brand_id,
        quantity: body.quantity,
        mood_id: body.mood_id,
        trigger_id: body.trigger_id,
        location_id: body.location_id,
        notes: body.notes,
      })
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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .schema("drink_log")
      .from("entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
