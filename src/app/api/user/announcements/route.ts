import { strapiFetch } from "@/utils/fetch";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const strapiUrl = new URL(`${process.env.STRAPI_BASE_URL}/announcements`);

  // TODO: Use user's subscription plan to filter out announcements

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");

  if (limit) {
    strapiUrl.searchParams.append("_limits", limit);
  }

  // Add query param to order announcements in descending order
  strapiUrl.searchParams.append("_sort", "createdAt:desc");

  // Fetch announcements in bulk from Strapi
  try {
    const data = await strapiFetch(strapiUrl);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("An error occurred while fetching strapi announcements", err);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 502 }
    );
  }
}
