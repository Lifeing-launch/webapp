import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAuthenticatedUser } from "@/utils/supabase/auth";

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
    }
    const supabase = await createClient();
    await supabase
      .from("user_profiles")
      .update({ dashboard_cover_img: url })
      .eq("id", user.id)
      .throwOnError()
      .single();
    return NextResponse.json({
      message: "Dashboard cover updated successfully",
    });
  } catch (error) {
    console.error("Error updating dashboard cover image", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
