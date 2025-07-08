"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import {
  useAnonymousProfile,
  useProfileSetup,
} from "@/hooks/use-anonymous-profile";

export const NicknameSetupModal = () => {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const { createProfile, loading, error } = useAnonymousProfile();

  const { needsSetup } = useProfileSetup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) return;

    setIsSubmitting(true);
    setCustomError(null);

    try {
      await createProfile(nickname.trim());
    } catch (err: unknown) {
      console.error("Error creating profile:", err);

      if (err instanceof Error) {
        if (
          err.name === "NicknameRejectedError" ||
          err.message === "NICKNAME_REJECTED" ||
          err.message.includes("NICKNAME_REJECTED")
        ) {
          setCustomError(
            "This nickname contains inappropriate content. Please choose a different one."
          );
        } else if (
          err.message.includes("duplicate key") ||
          err.message.includes("unique constraint")
        ) {
          setCustomError("This nickname is already in use. Try another one.");
        } else if (err.message.includes("Failed to moderate")) {
          setCustomError("Unable to validate nickname. Please try again.");
        } else {
          setCustomError(
            "An error occurred while creating your profile. Please try again."
          );
        }
      } else {
        setCustomError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    router.push("/dashboard");
  };

  const isValidNickname = nickname.trim().length >= 3;
  const displayError = customError || error;

  if (loading || !needsSetup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 rounded-full"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>

        <CardHeader className="text-center">
          <CardTitle>Welcome to Lifeing Forum!</CardTitle>
          <CardDescription>
            To start participating, choose a nickname that will be used
            anonymously in the forum. You can change it later.
            <br />
            <span className="text-xs text-muted-foreground/80 mt-1 block">
              You can skip this step by clicking the X to return to home page
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (customError) {
                    setCustomError(null);
                  }
                }}
                placeholder="Ex: Explorer123"
                maxLength={30}
                disabled={loading || isSubmitting}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Minimum 3 characters, maximum 30 characters
              </p>
            </div>

            {displayError && (
              <Alert variant="destructive">
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!isValidNickname || loading || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Enter the Forum"}
            </Button>
          </form>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Your privacy is important:</strong> This nickname will be
              used anonymously. No personal information will be shared with
              other users.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NicknameSetupModal;
