"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/form/submit-button";
import { signUpAction } from "@/utils/supabase/actions";
import Link from "next/link";
import { FormMessage } from "@/components/form/message";
import { AuthFormProps } from "@/typing/interfaces";

export function SignupForm({
  className,
  searchParams,
  ...props
}: AuthFormProps) {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    await signUpAction(formData);
  };

  return (
    <div className={cn("flex flex-col flex-1", className)} {...props}>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1 items-center">
                <h1 className="text-2xl font-semibold">Create Your Account</h1>
                <p className="text-sm text-muted-foreground">
                  Start Your 10-Day Free Trial
                </p>
              </div>
              <FormMessage message={searchParams} />
              <div className="flex gap-4">
                <div className="grid gap-1 w-full">
                  <Label htmlFor="firstname">First Name</Label>
                  <Input
                    id="firstname"
                    type="firstname"
                    name="firstname"
                    placeholder="Lorem"
                    className="text-sm"
                    required
                  />
                </div>
                <div className="grid gap-1 w-full">
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input
                    id="lastname"
                    type="lastname"
                    name="lastname"
                    placeholder="Ipsum"
                    className="text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="email@email.com"
                  className="text-sm"
                  required
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="********"
                  className="text-sm"
                  required
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="password">Confirm Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="cPassword"
                  placeholder="********"
                  className="text-sm"
                  required
                />
              </div>
              <SubmitButton className="w-full" pendingText="Signing up...">
                Sign up
              </SubmitButton>
              <p className="text-xs text-muted-foreground">
                By clicking &quot;Create account&quot; above, you acknowledge
                that you will receive updates from the Lifeing team and that you
                have read, understood, and agreed to Lifeing Library&apos;s{" "}
                <a href="#" className="underline">
                  terms & conditions
                </a>
                .
              </p>
              <div className="w-full border-t border-border" />

              <div className="text-center text-sm mb-2">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
