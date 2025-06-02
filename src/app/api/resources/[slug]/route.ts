import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { strapiFetch } from "@/utils/fetch";

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
  const strapiUrl = `${process.env.STRAPI_BASE_URL}/resources?${strapiQuery}`;

  try {
    const data = await strapiFetch(strapiUrl);
    return NextResponse.json(data);
  } catch (err) {
    console.error("An error occurred while fetching strapi resources", err);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 502 }
    );
  }
}
