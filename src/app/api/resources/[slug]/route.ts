import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { strapiFetch } from "@/utils/fetch";
import { CACHE_DURATIONS } from "@/utils/constants";
import { getStrapiBaseUrl } from "@/utils/urls";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  }
) {
  const { slug } = await params;
  // TODO: Type this correctly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strapiQueryObj: any = {
    filters: {
      $or: [],
      is_published: {
        $eq: true,
      },
      category: {
        $eq: "visual",
      },
      type: {
        $eq: "article", // We only support fetching aricles for now
      },
      slug,
    },
    populate: "*",
    pagination: {
      pageSize: 1,
    },
  };

  const strapiQuery = qs.stringify(strapiQueryObj, { encodeValuesOnly: true });
  const strapiUrl = `${getStrapiBaseUrl()}/resources?${strapiQuery}`;

  try {
    const data = await strapiFetch(strapiUrl, CACHE_DURATIONS.ARTICLES);

    // Set cache headers for browser caching
    const response = NextResponse.json(data);
    response.headers.set(
      "Cache-Control",
      `public, max-age=${CACHE_DURATIONS.ARTICLES}, s-maxage=${CACHE_DURATIONS.ARTICLES}`
    );

    return response;
  } catch (err) {
    console.error("An error occurred while fetching strapi resources", err);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 502 }
    );
  }
}
