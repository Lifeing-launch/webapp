import { NextResponse } from "next/server";
import qs from "qs";
import { strapiFetch } from "@/utils/fetch";
import { CACHE_DURATIONS } from "@/utils/constants";
import { getStrapiBaseUrl } from "@/utils/urls";

export async function GET() {
  const queryObj = {
    filters: {
      plan_status: {
        $in: ["ACTIVE"],
      },
    },
    populate: "features",
    sort: "price_monthly:asc",
  };
  const strapiQuery = qs.stringify(queryObj, { encodeValuesOnly: true });
  const strapiUrl = `${getStrapiBaseUrl()}/subscription-plans?${strapiQuery}`;

  try {
    const data = await strapiFetch(strapiUrl, CACHE_DURATIONS.PLANS);

    // Set cache headers for browser caching
    const response = NextResponse.json(data);
    response.headers.set(
      "Cache-Control",
      `public, max-age=${CACHE_DURATIONS.PLANS}, s-maxage=${CACHE_DURATIONS.PLANS}`
    );

    return response;
  } catch (err) {
    console.error("Error fetching active plans:", err);
    return NextResponse.json(
      { error: "Failed to fetch active plans" },
      { status: 502 }
    );
  }
}
