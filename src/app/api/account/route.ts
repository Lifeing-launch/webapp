import { getSupabaseUser } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface UpdateAccountRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
  avatarUrl?: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getSupabaseUser(supabase);

    const body: UpdateAccountRequest = await request.json();

    // Validate password fields
    const passwordValidation = validatePasswordFields(body);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Prepare metadata update
    const currentMetadata = user?.user_metadata || {};
    const { updatedMetadata, shouldUpdate } = prepareMetadataUpdate(
      body,
      currentMetadata
    );

    // Update forum display name
    const forumUpdateResult = await updateForumDisplayName(
      user.id,
      body.displayName
    );
    if (!forumUpdateResult.success) {
      return NextResponse.json(
        { error: forumUpdateResult.error },
        { status: 500 }
      );
    }

    // Update auth user (metadata, password, email) in a single call
    const authUpdateResult = await updateAuthUser(
      supabase,
      shouldUpdate ? updatedMetadata : undefined,
      body.password,
      body.email
    );

    if (!authUpdateResult.success) {
      return NextResponse.json(
        { error: authUpdateResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Account updated successfully",
      updatedFields: Object.keys(body).filter(
        (key) => body[key as keyof UpdateAccountRequest] !== undefined
      ),
    });
  } catch (error) {
    console.error("Error in account update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Validate password fields if either is provided
function validatePasswordFields(body: UpdateAccountRequest): ValidationResult {
  if (body.password || body.confirmPassword) {
    if (!body.password || !body.confirmPassword) {
      return {
        isValid: false,
        error: "Both password and confirm password are required",
      };
    }

    if (body.password !== body.confirmPassword) {
      return {
        isValid: false,
        error: "Passwords do not match",
      };
    }

    if (body.password.length < 6) {
      return {
        isValid: false,
        error: "Password must be at least 6 characters long",
      };
    }
  }

  return { isValid: true };
}

// Prepare metadata update - only include changed fields
function prepareMetadataUpdate(
  body: UpdateAccountRequest,
  currentMetadata: Record<string, string>
): { updatedMetadata: Record<string, string>; shouldUpdate: boolean } {
  const updatedMetadata = { ...currentMetadata };
  let shouldUpdate = false;

  // Generic metadata field comparison and update
  const metadataFields = ["firstName", "lastName", "avatarUrl"];
  metadataFields.forEach((field) => {
    const fieldValue = body[field as keyof UpdateAccountRequest];
    if (fieldValue !== undefined && fieldValue !== currentMetadata[field]) {
      updatedMetadata[field] = fieldValue;
      shouldUpdate = true;
    }
  });

  return { updatedMetadata, shouldUpdate };
}

// Update display name in anonymous_profiles table if needed
async function updateForumDisplayName(
  userId: string,
  displayName: string | undefined
): Promise<{ success: boolean; error?: string }> {
  if (displayName === undefined) {
    return { success: true };
  }

  try {
    const supabase = await createClient();

    // Check if anonymous profile exists using server client with forum schema
    const { data: existingProfile } = await supabase
      .schema("forum")
      .from("anonymous_profiles")
      .select("nickname")
      .eq("user_id", userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .schema("forum")
        .from("anonymous_profiles")
        .update({ nickname: displayName })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating anonymous profile:", updateError);
        return { success: false, error: "Failed to update display name" };
      }
    } else {
      // Create new profile
      const { error: createError } = await supabase
        .schema("forum")
        .from("anonymous_profiles")
        .insert({
          user_id: userId,
          nickname: displayName,
        });

      if (createError) {
        console.error("Error creating anonymous profile:", createError);
        return { success: false, error: "Failed to create display name" };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateForumDisplayName:", error);
    return { success: false, error: "Failed to update display name" };
  }
}

// Update auth user (metadata, password, email) in a single call
async function updateAuthUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  metadata: Record<string, string> | undefined,
  password: string | undefined,
  email: string | undefined
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: {
      data?: Record<string, string>;
      password?: string;
      email?: string;
    } = {};

    if (metadata && Object.keys(metadata).length > 0) {
      updateData.data = metadata;
    }

    if (password) {
      updateData.password = password;
    }

    if (email) {
      updateData.email = email;
    }

    // Only make the call if there's something to update
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase.auth.updateUser(updateData);

      if (error) {
        console.error("Error updating auth user:", error);
        return {
          success: false,
          error: "Failed to update user profile",
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateAuthUser:", error);
    return { success: false, error: "Failed to update user profile" };
  }
}
