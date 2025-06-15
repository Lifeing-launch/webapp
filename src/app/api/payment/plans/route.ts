import { NextResponse } from "next/server";
import qs from "qs";
import { strapiFetch } from "@/utils/fetch";
import { checkUserIsAuthenticated } from "@/utils/supabase/middleware";

export async function GET() {
  try {
    await checkUserIsAuthenticated();
  } catch {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const queryObj = {
    filters: {
      is_active: { $eq: true },
    },
    populate: "features",
    sort: "price_monthly:asc",
  };
  const strapiQuery = qs.stringify(queryObj, { encodeValuesOnly: true });
  const strapiUrl = `${process.env.STRAPI_BASE_URL}/subscription-plans?${strapiQuery}`;

  try {
    const data = await strapiFetch(strapiUrl);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching active plans:", err);
    return NextResponse.json(
      { error: "Failed to fetch active plans" },
      { status: 502 }
    );
  }
}
