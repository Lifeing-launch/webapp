import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { strapiFetch } from "@/utils/fetch";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_CATEGORY = "visual";

export async function GET(request: NextRequest) {
  const queryParams = qs.parse(new URL(request.url).search, {
    ignoreQueryPrefix: true,
  });
  const { page, q: searchQuery, showError, type, category } = queryParams;

  // TODO: Type this correctly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strapiQueryObj: any = {
    filters: {
      $or: [],
      is_published: {
        $eq: true,
      },
      category: {
        $eq: category || DEFAULT_CATEGORY,
      },
    },
    sort: "title:desc",
  };

  if (page) {
    strapiQueryObj["pagination"] = {
      page: page,
      pageSize: DEFAULT_PAGE_SIZE,
      withCount: true,
    };
  }

  if (searchQuery) {
    strapiQueryObj["filters"]["$or"].push(
      ...[
        {
          title: {
            $containsi: searchQuery,
          },
        },
        {
          description: {
            $containsi: searchQuery,
          },
        },
      ]
    );
  }

  if (type === "bookmarked") {
    // fetch bookmarked resources from supabase
  } else if (type) {
    strapiQueryObj["filters"]["$or"].push({
      type: {
        $eqi: type,
      },
    });
  }

  const strapiUrl = `${process.env.STRAPI_BASE_URL}/resources`;
  const strapiQuery = qs.stringify(strapiQueryObj, { encodeValuesOnly: true });

  try {
    const data = await strapiFetch(`${strapiUrl}?${strapiQuery}`);
    console.log("QUERY", `${strapiUrl}?${strapiQuery}`);
    if (showError) throw new Error("Fake error");
    return NextResponse.json(data);
  } catch (err) {
    console.error("An error occurred while fetching strapi resources", err);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 502 }
    );
  }
}
