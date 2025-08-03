// app/api/meetings/route.ts
import { strapiFetch } from "@/utils/fetch";
import { getAuthenticatedUser } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";
import { getStrapiBaseUrl } from "@/utils/urls";
import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { Meeting } from "@/typing/strapi";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const rsvpOnly = searchParams.get("rsvpOnly");
    const hydrateRsvp = searchParams.get("hydrateRsvp") === "true";
    const dateFrom = searchParams.get("dateFrom") || new Date().toISOString();
    const dateTo = searchParams.get("dateTo");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const strapiQueryObj: any = {
      filters: {
        when: {
          $gte: dateFrom,
        },
        id: {
          $in: [],
        },
      },
      sort: "when:asc",
    };

    if (dateTo) {
      strapiQueryObj.filters.when["$lte"] = dateTo;
    }

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

      strapiQueryObj["filters"]["id"]["$in"] = meetingIds;
      strapiQueryObj["pagination"] = {
        page: 1,
        pageSize: 2,
      };
    }

    const strapiQuery = qs.stringify(strapiQueryObj, {
      encodeValuesOnly: true,
    });
    const strapiUrl = `${getStrapiBaseUrl()}/meetings?${strapiQuery}`;

    // Fetch future meetings in bulk from Strapi
    const data = await strapiFetch(strapiUrl);

    // If hydrateRsvp is requested, enrich meetings with RSVP status
    if (hydrateRsvp && data.data) {
      // Fetch user's RSVPs
      const { data: rsvps } = await supabase
        .from("rsvps")
        .select("meeting_id")
        .eq("user_id", user.id)
        .throwOnError();

      // Create a Set of RSVP'd meeting IDs for efficient lookup
      const rsvpedMeetingIds = new Set(
        rsvps?.map((rsvp) => Number(rsvp.meeting_id)) || []
      );

      // Enrich meetings with hasRsvped status
      data.data = data.data.map((meeting: Meeting) => ({
        ...meeting,
        hasRsvped: rsvpedMeetingIds.has(meeting.id),
      }));
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("An error occurred while fetching strapi meetings", err);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 502 }
    );
  }
}
