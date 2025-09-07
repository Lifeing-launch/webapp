import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { strapiFetch } from "@/utils/fetch";
import { getStrapiBaseUrl } from "@/utils/urls";
import { getAuthenticatedUser } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";
import { MindfulModerationSession } from "@/typing/strapi";
import { PlanService } from "@/services/plan";

// Always fetch 20 sessions for now. Introduce pagination if we ever exceed this.
const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const supabase = await createClient();

    // Get the user's subscription plan
    const { data: subscription } = await supabase
      .from("active_subscriptions")
      .select("plan_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const hasAccess = await PlanService.canAccessPlanProtectedPage(
      "/mindful-moderation",
      subscription
    );

    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const queryParams = qs.parse(new URL(request.url).search, {
      ignoreQueryPrefix: true,
    });
    const { page, hydrateRsvp } = queryParams;
    const dateFrom = new Date().toISOString();

    // TODO: Type this correctly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const strapiQueryObj: any = {
      sort: "meeting:when:asc",
      populate: ["coach", "meeting"],
      pagination: {
        page: page || 1,
        pageSize: DEFAULT_PAGE_SIZE,
      },
      filters: {
        meeting: {
          when: {
            $gte: dateFrom,
          },
        },
      },
    };

    const strapiQuery = qs.stringify(strapiQueryObj, {
      encodeValuesOnly: true,
    });
    const strapiUrl = `${getStrapiBaseUrl()}/mindful-moderations?${strapiQuery}`;

    const data = await strapiFetch(strapiUrl);

    // If hydrateRsvp is requested and there are sessions with meetings, enrich meetings with RSVP status
    if (hydrateRsvp === "true" && data.data) {
      // Fetch user's RSVPs
      const { data: rsvps } = await supabase
        .from("rsvps")
        .select("meeting_id")
        .eq("user_id", user.id)
        .in(
          "meeting_id",
          data.data
            .map((session: MindfulModerationSession) => session?.meeting?.id)
            .filter(Boolean)
        )
        .throwOnError();

      // Create a Set of RSVP'd meeting IDs for efficient lookup
      const rsvpedMeetingIds = new Set(
        rsvps?.map((rsvp) => Number(rsvp.meeting_id)) || []
      );

      // Enrich sessions with meeting RSVP status
      data.data = data.data.map((session: MindfulModerationSession) => {
        if (session.meeting) {
          const meeting = session.meeting;
          return {
            ...session,
            meeting: {
              ...meeting,
              hasRsvped: rsvpedMeetingIds.has(meeting.id),
            },
          };
        }
        return session;
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(
      "An error occurred while fetching strapi mindful moderation sessions",
      err
    );
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 502 }
    );
  }
}
