import { strapiFetch } from "@/utils/fetch";
import { checkUserIsAuthenticated } from "@/utils/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";
import qs from "qs";

export async function GET(request: NextRequest) {
  try {
    await checkUserIsAuthenticated();
  } catch {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // TODO: Use user's subscription plan to filter out announcements
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strapiQueryObj: any = {
    pagination: {
      pageSize: undefined,
    },
    // Add query param to fetch announcements for user specific plans
    sort: "createdAt:desc",
  };

  if (limit) {
    strapiQueryObj.pagination.pageSize = limit;
  }

  const strapiQuery = qs.stringify(strapiQueryObj, { encodeValuesOnly: true });
  const strapiUrl = `${process.env.STRAPI_BASE_URL}/announcements?${strapiQuery}`;

  // Fetch announcements in bulk from Strapi
  try {
    const { data } = await strapiFetch(strapiUrl);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("An error occurred while fetching strapi announcements", err);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 502 }
    );
  }
}
