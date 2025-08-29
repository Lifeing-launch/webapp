import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { strapiFetch } from "@/utils/fetch";
import { getStrapiBaseUrl } from "@/utils/urls";
import { getAuthenticatedUser } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";
import { Book } from "@/typing/strapi";

// Always fetch 20 books for now. Introduce pagination if we ever exceed this.
const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const supabase = await createClient();

    const queryParams = qs.parse(new URL(request.url).search, {
      ignoreQueryPrefix: true,
    });
    const { page, hydrateRsvp } = queryParams;

    // TODO: Type this correctly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const strapiQueryObj: any = {
      sort: "title:asc",
      populate: ["cover_img", "meeting"],
      pagination: {
        page: page || 1,
        pageSize: DEFAULT_PAGE_SIZE,
      },
    };

    const strapiQuery = qs.stringify(strapiQueryObj, {
      encodeValuesOnly: true,
    });
    const strapiUrl = `${getStrapiBaseUrl()}/books?${strapiQuery}`;

    const data = await strapiFetch(strapiUrl);

    // If hydrateRsvp is requested and there are books with meetings, enrich meetings with RSVP status
    if (hydrateRsvp === "true" && data.data) {
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

      // Enrich books with meeting RSVP status
      data.data = data.data.map((book: Book) => {
        if (book.meeting) {
          const meeting = book.meeting;
          return {
            ...book,
            meeting: {
              ...meeting,
              hasRsvped: rsvpedMeetingIds.has(meeting.id),
            },
          };
        }
        return book;
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("An error occurred while fetching strapi books", err);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 502 }
    );
  }
}
