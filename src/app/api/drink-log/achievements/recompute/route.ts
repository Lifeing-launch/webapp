import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
    const body = await request.json().catch(() => ({}));
    
    // Default to last 180 days if no range provided
    const defaultFrom = new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)
      .toISOString()
      .slice(0, 10); // YYYY-MM-DD format
    
    const defaultTo = new Date().toISOString().slice(0, 10);
    
    const from = body.from ?? defaultFrom;
    const to = body.to ?? defaultTo;

    // Validate date format (basic validation)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      return NextResponse.json(
        {
          error: "Invalid date format. Use YYYY-MM-DD",
        },
        { status: 400 }
      );
    }

    // Ensure from date is not after to date
    if (from > to) {
      return NextResponse.json(
        {
          error: "From date cannot be after to date",
        },
        { status: 400 }
      );
    }

    // Call the stored procedure to recompute achievements
    const { data, error } = await supabase.rpc("award_badges", {
      p_from: from,
      p_to: to,
    });

    if (error) {
      console.error("Error calling award_badges RPC:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract the inserted count from the response
    const insertedCount = data?.[0]?.inserted_count ?? 0;

    return NextResponse.json({
      inserted: insertedCount,
      from,
      to,
      message: `Recomputed achievements for period ${from} to ${to}. ${insertedCount} new achievements awarded.`,
    });
  } catch (error) {
    console.error("Unexpected error in recompute endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}