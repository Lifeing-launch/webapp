import { NextRequest, NextResponse } from "next/server";
import { checkUserIsAuthenticated } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await checkUserIsAuthenticated();

    const { resource_id, resource_type, content } = await request.json();

    if (!resource_type) {
      return NextResponse.json(
        { error: "Missing resource_type" },
        { status: 400 }
      );
    }

    if (!["post", "comment", "nickname"].includes(resource_type)) {
      return NextResponse.json(
        {
          error:
            "Invalid resource_type. Must be 'post', 'comment', or 'nickname'",
        },
        { status: 400 }
      );
    }

    if (resource_type === "nickname") {
      if (!content) {
        return NextResponse.json(
          { error: "Missing content for nickname moderation" },
          { status: 400 }
        );
      }
    } else {
      // Para posts e comments
      if (!resource_id) {
        return NextResponse.json(
          { error: "Missing resource_id for post/comment moderation" },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();

    const requestBody = {
      resource_type,
      ...(resource_type === "nickname"
        ? { content, user_id: user.id }
        : { resource_id }),
    };

    const { data, error } = await supabase.functions.invoke(
      "moderate-resource",
      {
        body: requestBody,
      }
    );

    if (error) {
      console.error("Edge function error:", error);
      return NextResponse.json(
        { error: "Failed to moderate resource" },
        { status: 500 }
      );
    }

    if (resource_type === "nickname") {
      return NextResponse.json({
        success: true,
        isValid: data.status === "approved",
        status: data.status,
        message:
          data.status === "approved"
            ? "Nickname is valid"
            : "Nickname contains inappropriate content",
      });
    }

    return NextResponse.json({
      success: true,
      message: `${resource_type} moderated successfully`,
      status: data.status,
    });
  } catch (error) {
    console.error("Moderation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
