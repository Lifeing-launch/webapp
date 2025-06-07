import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { strapiFetch } from "@/utils/fetch";
import { createClient } from "@/utils/supabase/server";

// Always fetch 20 coaches for now. Introduce pagination if we ever exceed this.
const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const strapiUrl = `${process.env.STRAPI_BASE_URL}/coaches?${strapiQuery}`;

  try {
    const data = await strapiFetch(strapiUrl);
    return NextResponse.json(data);
  } catch (err) {
    console.error("An error occurred while fetching strapi coaches", err);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 502 }
    );
  }
}
