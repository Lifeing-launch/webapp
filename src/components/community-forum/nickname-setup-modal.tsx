"use client";

import React, { useState } from "react";
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
import {
  useAnonymousProfile,
  useProfileSetup,
} from "@/hooks/use-anonymous-profile";

/**
 * Modal for initial nickname setup
 * Appears when the user accesses the forum for the first time
 */
export const NicknameSetupModal = () => {
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createProfile, loading, error } = useAnonymousProfile();

  const { needsSetup } = useProfileSetup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) return;

    setIsSubmitting(true);
    try {
      await createProfile(nickname.trim());
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidNickname = nickname.trim().length >= 3;

  if (!needsSetup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle>Welcome to Lifeing Forum!</CardTitle>
          <CardDescription>
            To start participating, choose a nickname that will be used
            anonymously in the forum. You can change it later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: Explorer123"
                maxLength={30}
                disabled={loading || isSubmitting}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Minimum 3 characters, maximum 30 characters
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error ===
                  'duplicate key value violates unique constraint "anonymous_profiles_nickname_key"'
                    ? "This nickname is already in use. Try another one."
                    : error}
                </AlertDescription>
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
