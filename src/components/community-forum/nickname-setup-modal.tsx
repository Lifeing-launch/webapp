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
import { classifyForumError } from "@/utils/forum-error-handler";

export const NicknameSetupModal = () => {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const { createProfile, loading } = useAnonymousProfile();
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

      const { message } = classifyForumError(err);
      setCustomError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    router.push("/dashboard");
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    if (customError) {
      setCustomError(null);
    }
  };

  const isValidNickname = nickname.trim().length >= 3;

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
                onChange={handleNicknameChange}
                placeholder="Ex: Explorer123"
                maxLength={30}
                disabled={loading || isSubmitting}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Minimum 3 characters, maximum 30 characters
              </p>
            </div>

            {customError && (
              <Alert variant="destructive">
                <AlertDescription>{customError}</AlertDescription>
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
