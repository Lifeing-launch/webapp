import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { strapiFetch } from "@/utils/fetch";
import { createClient } from "@/utils/supabase/server";
import { checkUserIsAuthenticated } from "@/utils/supabase/auth";
import { getStrapiBaseUrl } from "@/utils/urls";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_CATEGORY = "visual";

export async function GET(request: NextRequest) {
  let user;

  try {
    user = await checkUserIsAuthenticated();
  } catch {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const supabase = await createClient();

  const queryParams = qs.parse(new URL(request.url).search, {
    ignoreQueryPrefix: true,
  });
  const { page, pageSize, q: searchQuery, type, category } = queryParams;

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
      id: {
        $in: [],
      },
    },
    sort: "title:desc",
    populate: "cover_img",
  };

  if (page) {
    strapiQueryObj["pagination"] = {
      page: page,
      pageSize: pageSize || DEFAULT_PAGE_SIZE,
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

  if (type === "bookmark") {
    // fetch bookmarked resources for user from supabase
    const { data: bookmarks, error: bookmarkError } = await supabase
      .from("bookmarks")
      .select("resource_id")
      .eq("user_id", user.id);

    if (bookmarkError) {
      console.error(
        "An error occurred while fetching bookmarks",
        bookmarkError
      );
      return NextResponse.json(
        { error: bookmarkError.message },
        { status: 500 }
      );
    }

    const resourceIds = bookmarks.map((bookmark) => bookmark.resource_id);
    if (!resourceIds.length) return NextResponse.json({ resources: [] });

    strapiQueryObj["filters"]["id"]["$in"].push(...resourceIds);
  } else if (type) {
    strapiQueryObj["filters"]["$or"].push({
      type: {
        $eqi: type,
      },
    });
  }

  const strapiQuery = qs.stringify(strapiQueryObj, { encodeValuesOnly: true });
  const strapiUrl = `${getStrapiBaseUrl()}/resources?${strapiQuery}`;

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
