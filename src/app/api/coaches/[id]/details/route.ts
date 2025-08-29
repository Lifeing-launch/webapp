import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/supabase/auth";
import { strapiFetch } from "@/utils/fetch";
import { getStrapiBaseUrl } from "@/utils/urls";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    getAuthenticatedUser(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Coach ID is required" },
      { status: 400 }
    );
  }

  try {
    // Build the Strapi URL - getStrapiBaseUrl already includes /api
    // The staging Strapi has a custom /details endpoint for coaches
    const strapiUrl = `${getStrapiBaseUrl()}/coaches/${id}/details`;

    const data = await strapiFetch(strapiUrl);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in coach details API route:", err);
    return NextResponse.json(
      { error: "Failed to fetch coach details" },
      { status: 500 }
    );
  }
}
