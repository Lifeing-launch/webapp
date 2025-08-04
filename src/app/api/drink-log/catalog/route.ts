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

    const [drinkTypes, moods, triggers, locations] = await Promise.all([
      supabase
        .schema("drink_log")
        .from("drink_types")
        .select("*")
        .order("name"),
      supabase.schema("drink_log").from("moods").select("*").order("name"),
      supabase.schema("drink_log").from("triggers").select("*").order("name"),
      supabase.schema("drink_log").from("locations").select("*").order("name"),
    ]);

    const drinkBrands = await supabase
      .schema("drink_log")
      .from("drink_brands")
      .select("*")
      .order("name");

    return NextResponse.json({
      drinkTypes: drinkTypes.data || [],
      drinkBrands: drinkBrands.data || [],
      moods: moods.data || [],
      triggers: triggers.data || [],
      locations: locations.data || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
