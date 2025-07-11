"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/form/submit-button";
import { AuthFormProps } from "@/typing/interfaces";
import { FormMessage } from "@/components/form/message";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { sendPasswordResetEmailAction } from "@/utils/supabase/actions";

const ForgotPasswordForm = ({ searchParams }: AuthFormProps) => {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    await sendPasswordResetEmailAction(formData);
  };

  return (
    <div className="w-full">
      <Card>
        <CardContent>
          <form className="flex flex-col gap-9" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">Forgot Password</h1>
              <FormMessage message={searchParams} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Enter your email address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="email@email.com"
                className="text-sm"
                required
              />
            </div>

            <SubmitButton className="w-full" pendingText="Sending...">
              {" "}
              Send Reset Link{" "}
            </SubmitButton>

            <div className="text-sm">
              If your email is registered, you&apos;ll receive a reset link.
            </div>

            <Link href="/login" className="text-sm text-primary">
              Back to login
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
