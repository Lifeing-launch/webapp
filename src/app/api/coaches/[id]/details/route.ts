import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/supabase/auth";
import { API_CONFIG } from "@/utils/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    getAuthenticatedUser(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Coach ID is required" },
      { status: 400 }
    );
  }

  try {
    const strapiUrl =
      process.env.NEXT_PUBLIC_STRAPI_URL || API_CONFIG.STRAPI_URL;
    const strapiToken =
      process.env.STRAPI_API_TOKEN || API_CONFIG.STRAPI_API_KEY;

    if (!strapiUrl || !strapiToken) {
      console.error("Missing Strapi configuration");
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    const response = await fetch(`${strapiUrl}/api/coaches/${id}/details`, {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Error fetching coach details: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in coach details API route:", err);
    return NextResponse.json(
      { error: "Failed to fetch coach details" },
      { status: 500 }
    );
  }
}
