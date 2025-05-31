// app/api/user/meetings/route.ts
import { strapiFetch } from "@/utils/fetch";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const strapiUrl = new URL(`${process.env.STRAPI_BASE_URL}/meetings`);
  strapiUrl.searchParams.append(
    "filters[when][$gte]",
    new Date().toISOString()
  );

  const { searchParams } = new URL(request.url);
  const rsvpOnly = searchParams.get("rsvpOnly");

  if (rsvpOnly) {
    // 1. Get meeting IDs the user RSVP'd to
    const { data: rsvps, error: rsvpError } = await supabase
      .from("rsvps")
      .select("meeting_id")
      .eq("user_id", user.id);

    if (rsvpError) {
      console.error("An error occurred while fetching rsvps", rsvpError);
      return NextResponse.json({ error: rsvpError.message }, { status: 500 });
    }

    const meetingIds = rsvps.map((rsvp) => rsvp.meeting_id);
    if (!meetingIds.length) return NextResponse.json({ meetings: [] });

    // Append meetingIds filter (assumes comma-separated ids)
    strapiUrl.searchParams.append("filters[id][$in]", meetingIds.join(","));
  }

  // Fetch future meetings in bulk from Strapi
  try {
    const { data } = await strapiFetch(strapiUrl);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("An error occurred while fetching strapi meetings", err);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 502 }
    );
  }
}
