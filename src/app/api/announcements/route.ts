import { strapiFetch } from "@/utils/fetch";
import { checkUserIsAuthenticated } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";
import { getStrapiBaseUrl } from "@/utils/urls";
import { NextRequest, NextResponse } from "next/server";
import qs from "qs";

const DEFAULT_PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  let user;

  try {
    user = await checkUserIsAuthenticated();
  } catch {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("active_subscriptions")
    .select("*")
    .eq("user_id", user?.id)
    .single();
  const planId = subscription.plan_id;

  const { searchParams } = new URL(request.url);
  const pageSize = searchParams.get("pageSize") || DEFAULT_PAGE_SIZE;
  const page = searchParams.get("page");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strapiQueryObj: any = {
    pagination: {
      pageSize,
      page,
    },
    populate: "*",
    filters: {
      $or: [
        { subscription_plans: { id: { $eq: planId } } },
        { subscription_plans: { id: { $null: true } } },
      ],
    },
    // Add query param to fetch announcements for user specific plans
    sort: "createdAt:desc",
  };

  const strapiQuery = qs.stringify(strapiQueryObj, { encodeValuesOnly: true });
  const strapiUrl = `${getStrapiBaseUrl()}/announcements?${strapiQuery}`;

  // Fetch announcements in bulk from Strapi
  try {
    const { data, meta } = await strapiFetch(strapiUrl);
    return NextResponse.json({ data, meta });
  } catch (err) {
    console.error("An error occurred while fetching strapi announcements", err);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 502 }
    );
  }
}
