import { NextRequest, NextResponse } from "next/server";
import qs from "qs";

const resources = [
  {
    id: 1,
    title: "10 Ways to Reduce Stress",
    type: "article",
    description:
      "A helpful article to guide you through practical techniques for stress management.",
    createdAt: "2025-04-23T18:25:43.511Z",
  },
  {
    id: 2,
    title: "Understanding Document Management",
    type: "document",
    description:
      "An in-depth look at organizing and managing important documents.",
    createdAt: "2025-05-01T10:15:30.000Z",
  },
  {
    id: 3,
    title: "Learning Video Production",
    type: "video",
    description:
      "A tutorial video on the basics of producing engaging content.",
    createdAt: "2025-05-10T12:20:00.000Z",
  },
  {
    id: 4,
    title: "Mindfulness Techniques",
    type: "article",
    description:
      "Explore mindfulness techniques to improve mental clarity and peace.",
    createdAt: "2025-05-12T08:00:00.000Z",
  },
  {
    id: 5,
    title: "Digital Document Security",
    type: "document",
    description:
      "Learn about securing your digital documents against unauthorized access.",
    createdAt: "2025-05-15T09:30:00.000Z",
  },
  {
    id: 6,
    title: "How to Edit Videos Like a Pro",
    type: "video",
    description:
      "Step-by-step video tutorial on professional video editing techniques.",
    createdAt: "2025-05-20T14:00:00.000Z",
  },
  {
    id: 7,
    title: "Effective Communication Strategies",
    type: "article",
    description:
      "An article discussing efficient communication in professional environments.",
    createdAt: "2025-05-25T16:45:00.000Z",
  },
  {
    id: 8,
    title: "Managing Project Documents",
    type: "document",
    description:
      "Best practices for managing project-related documents efficiently.",
    createdAt: "2025-06-01T11:10:00.000Z",
  },
  {
    id: 9,
    title: "Creating Engaging Tutorial Videos",
    type: "video",
    description:
      "A guide to creating engaging and informative tutorial videos.",
    createdAt: "2025-06-05T13:35:00.000Z",
  },
  {
    id: 10,
    title: "Balanced Life: Work and Relaxation",
    type: "article",
    description:
      "Discussing strategies to balance your professional workload and personal relaxation.",
    createdAt: "2025-06-10T15:00:00.000Z",
  },
];

const meta = {
  pagination: {
    page: 1,
    pageSize: 10,
    pageCount: 1,
    total: 10,
  },
};

const DEFAULT_PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  // const strapiUrl = new URL(`${process.env.STRAPI_BASE_URL}/resources`);

  const queryParams = qs.parse(new URL(request.url).search, {
    ignoreQueryPrefix: true,
  });
  const { page, searchQuery, showError, type } = queryParams;

  // TODO: Type this correctly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strapiQueryObj: any = {
    filters: {
      $or: [],
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
  } else {
    strapiQueryObj["filters"]["$or"].push({
      type: {
        $eqi: type,
      },
    });
  }

  // const strapiQuery = qs.stringify(strapiQueryObj, { encodeValuesOnly: true });
  // console.log(`${strapiUrl}?${strapiQuery}`);

  try {
    // const data = await strapiFetch(strapiUrl);
    if (showError) throw new Error("Fake error");
    return NextResponse.json({ data: resources, meta });
  } catch (err) {
    console.error("An error occurred while fetching strapi resources", err);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 502 }
    );
  }
}
