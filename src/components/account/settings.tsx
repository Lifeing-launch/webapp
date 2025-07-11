"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthFormProps } from "@/typing/interfaces";
import { ProfilePicture } from "./profile-picture";
import { HintLabel } from "@/components/form/hint-label";
import { createClient } from "@/utils/supabase/browser";
import { forumClient } from "@/utils/supabase/forum";
import { toast } from "sonner";
import { AccountSettingsSkeleton } from "./skeleton";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

interface UserData {
  profile: UserProfile;
  currentDisplayName: string;
}

export function AccountSettings({ className, ...props }: AuthFormProps) {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    displayName: "",
    avatarUrl: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load current user profile
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchUserData();
        setProfile(userData.profile);
      } catch (error) {
        console.error("Error loading user profile:", error);
        toast.error("Failed to load user profile");
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare update data - only include changed fields
      const updateData: Record<string, string> = {};

      // Get current data for comparison
      const userData = await fetchUserData();

      // Check for changes in profile fields
      if (profile.firstName !== userData.profile.firstName) {
        updateData.firstName = profile.firstName;
      }
      if (profile.lastName !== userData.profile.lastName) {
        updateData.lastName = profile.lastName;
      }
      if (profile.email !== userData.profile.email) {
        updateData.email = profile.email;
      }
      if (profile.avatarUrl !== userData.profile.avatarUrl) {
        updateData.avatarUrl = profile.avatarUrl;
      }
      if (profile.displayName !== userData.currentDisplayName) {
        updateData.displayName = profile.displayName;
      }

      // Add password fields if provided
      if (password) {
        updateData.password = password;
        updateData.confirmPassword = confirmPassword;
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length === 0) {
        toast("No changes detected", {
          description: "No fields have been modified.",
        });
        return;
      }

      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update account");
      }

      toast.success("Account updated successfully");

      // Clear password fields after successful update
      setPassword("");
      setConfirmPassword("");

      // Refresh current data after successful update
      const updatedUserData = await fetchUserData();
      setProfile(updatedUserData.profile);
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update account"
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <AccountSettingsSkeleton />;
  }

  const userInitials = `${profile.firstName.charAt(0) || "?"}${profile.lastName.charAt(0) || "?"}`;

  return (
    <div className={cn("flex flex-col flex-1 max-w-lg", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="profilePicture">Profile Picture</Label>
            <ProfilePicture
              userInitials={userInitials}
              currentUrl={profile.avatarUrl}
              onUpload={(avatarUrl?: string) =>
                setProfile((prev) => ({ ...prev, avatarUrl: avatarUrl || "" }))
              }
            />
          </div>

          <div className="flex gap-4">
            <div className="grid gap-1 w-full">
              <Label htmlFor="firstname">First Name</Label>
              <Input
                id="firstname"
                type="text"
                name="firstname"
                placeholder="Lorem"
                className="text-sm"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, firstName: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-1 w-full">
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                type="text"
                name="lastname"
                placeholder="Ipsum"
                className="text-sm"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, lastName: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="email@email.com"
              className="text-sm"
              value={profile.email}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="flex gap-2">
            <div className="grid gap-2 flex-1">
              <HintLabel
                htmlFor="password"
                hint="Leave blank to keep current password"
              >
                Password
              </HintLabel>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="New password"
                className="text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2 flex-1">
              <HintLabel
                htmlFor="cPassword"
                hint="Leave blank to keep current password"
              >
                Confirm Password
              </HintLabel>
              <Input
                id="cPassword"
                type="password"
                name="cPassword"
                placeholder="Confirm new password"
                className="text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <HintLabel
              htmlFor="displayName"
              hint="Your display name to be used anonymously in the community forum"
            >
              Lifeing Lounge Display Name
            </HintLabel>

            <Input
              className="text-sm"
              required
              id="displayName"
              placeholder="username"
              value={profile.displayName}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, displayName: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Button size={"sm"} type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update profile"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Abstracted function to fetch user data
async function fetchUserData(): Promise<UserData> {
  const supabase = createClient();

  // Get the logged-in user's ID
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    throw new Error("Failed to get authenticated user");
  }

  const userId = authData.user.id;

  // Query the user_profiles table for basic profile data
  const { data: profileData } = await supabase
    .from("user_profiles")
    .select("first_name, last_name, email, avatar_url")
    .eq("id", userId)
    .single()
    .throwOnError();

  // Query the anonymous_profiles table for display name using forumClient
  let currentDisplayName = "";
  try {
    const { data: anonymousProfileData } = await forumClient
      .from("anonymous_profiles")
      .select("nickname")
      .eq("user_id", userId)
      .maybeSingle()
      .throwOnError();

    currentDisplayName = anonymousProfileData?.nickname || "";
  } catch {
    // Don't treat missing anonymous profile as an error - it might not exist yet
    // This will be handled gracefully by setting currentDisplayName to empty string
  }

  const profile: UserProfile = {
    firstName: profileData.first_name || "",
    lastName: profileData.last_name || "",
    email: profileData.email || "",
    avatarUrl: profileData.avatar_url || "",
    displayName: currentDisplayName,
  };

  return {
    profile,
    currentDisplayName,
  };
}
