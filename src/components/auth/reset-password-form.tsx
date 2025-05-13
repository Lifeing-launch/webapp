"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { SubmitButton } from "../form/submit-button";
import { AuthFormProps } from "@/typing/interfaces";
import { FormMessage } from "./form-message";
import { Input } from "../ui/input";
import { updatePasswordAction } from "@/utils/supabase/actions";

const ResetPasswordForm = ({ searchParams }: AuthFormProps) => {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    await updatePasswordAction(formData);
  };

  return (
    <div className="w-full">
      <Card>
        <CardContent>
          <form className="flex flex-col gap-9" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">Reset Your Password</h1>
              <FormMessage message={searchParams} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="********"
                className="text-sm"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Confirm Password</Label>
              <Input
                id="password"
                type="password"
                name="cPassword"
                placeholder="Re-enter new password"
                className="text-sm"
                required
              />
            </div>

            <SubmitButton className="w-full" pendingText="Resetting...">
              {" "}
              Reset Password{" "}
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordForm;
