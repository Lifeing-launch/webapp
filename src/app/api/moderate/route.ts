import { NextRequest, NextResponse } from "next/server";
import { checkUserIsAuthenticated } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    await checkUserIsAuthenticated();

    const { resource_id, resource_type } = await request.json();

    if (!resource_id || !resource_type) {
      return NextResponse.json(
        { error: "Missing resource_id or resource_type" },
        { status: 400 }
      );
    }

    if (!["post", "comment"].includes(resource_type)) {
      return NextResponse.json(
        { error: "Invalid resource_type. Must be 'post' or 'comment'" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke(
      "moderate-resource",
      {
        body: {
          resource_id,
          resource_type,
        },
      }
    );

    if (error) {
      console.error("Edge function error:", error);
      return NextResponse.json(
        { error: "Failed to moderate resource" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${resource_type} moderated successfully`,
      data,
    });
  } catch (error) {
    console.error("Moderation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
