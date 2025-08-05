import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { strapiFetch } from "@/utils/fetch";
import { CACHE_DURATIONS } from "@/utils/constants";
import { getStrapiBaseUrl } from "@/utils/urls";

// Always fetch 20 coaches for now. Introduce pagination if we ever exceed this.
const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const queryParams = qs.parse(new URL(request.url).search, {
    ignoreQueryPrefix: true,
  });
  const { page } = queryParams;

  // TODO: Type this correctly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strapiQueryObj: any = {
    sort: "name:asc",
    populate: "avatar",
    pagination: {
      page: page || 1,
      pageSize: DEFAULT_PAGE_SIZE,
    },
  };

  const strapiQuery = qs.stringify(strapiQueryObj, { encodeValuesOnly: true });
  const strapiUrl = `${getStrapiBaseUrl()}/coaches?${strapiQuery}`;

  try {
    const data = await strapiFetch(strapiUrl, CACHE_DURATIONS.COACHES);

    // Set cache headers for browser caching
    const response = NextResponse.json(data);
    response.headers.set(
      "Cache-Control",
      `public, max-age=${CACHE_DURATIONS.COACHES}, s-maxage=${CACHE_DURATIONS.COACHES}`
    );

    return response;
  } catch (err) {
    console.error("An error occurred while fetching strapi coaches", err);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 502 }
    );
  }
}
