"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthFormProps } from "@/typing/interfaces";
import { ProfilePicture } from "./profile-picture";
import { HintLabel } from "@/components/form/hint-label";
import { useUser } from "@/components/providers/user-provider";
import { toast } from "sonner";
import { AccountSettingsSkeleton } from "./skeleton";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

export function AccountSettings({ className, ...props }: AuthFormProps) {
  const {
    profile: userProfile,
    currentDisplayName,
    loading: userLoading,
    refetchProfile,
  } = useUser();

  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    email: "",
    displayName: "",
    avatarUrl: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfile({
        firstName: userProfile.first_name || "",
        lastName: userProfile.last_name || "",
        email: userProfile.email || "",
        displayName: currentDisplayName,
        avatarUrl: userProfile.avatar_url || "",
      });
    }
  }, [userProfile, currentDisplayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare update data - only include changed fields
      const updateData: Record<string, string> = {};

      // Check for changes in profile fields
      if (profile.firstName !== userProfile?.first_name) {
        updateData.firstName = profile.firstName;
      }
      if (profile.lastName !== userProfile?.last_name) {
        updateData.lastName = profile.lastName;
      }
      if (profile.email !== userProfile?.email) {
        updateData.email = profile.email;
      }
      if (profile.avatarUrl !== userProfile?.avatar_url) {
        updateData.avatarUrl = profile.avatarUrl;
      }
      if (profile.displayName !== currentDisplayName) {
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

      refetchProfile();
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update account"
      );
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
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
              hint="Your display name to be used anonymously in the lifeing lounge"
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
