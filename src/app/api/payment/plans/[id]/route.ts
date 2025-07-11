import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { strapiFetch } from "@/utils/fetch";
import { checkUserIsAuthenticated } from "@/utils/supabase/auth";
import { getStrapiBaseUrl } from "@/utils/urls";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await checkUserIsAuthenticated();
  } catch {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  const queryObj = {
    filters: {
      id,
      plan_status: {
        $in: ["ACTIVE", "RETIRED"],
      },
    },
    populate: "features",
    pagination: {
      pageSize: 1,
    },
  };
  const strapiQuery = qs.stringify(queryObj, { encodeValuesOnly: true });
  const strapiUrl = `${getStrapiBaseUrl()}/subscription-plans?${strapiQuery}`;

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
