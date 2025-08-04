"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/form/submit-button";
import { loginAction } from "@/utils/supabase/actions";
import { FormMessage } from "@/components/form/message";
import { AuthFormProps } from "@/typing/interfaces";

export function LoginForm({
  className,
  searchParams,
  ...props
}: AuthFormProps) {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    await loginAction(formData);
  };

  return (
    <div className={cn("flex flex-col flex-1", className)} {...props}>
      <Card>
        <CardContent className="grid">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-1">
                <h1 className="text-2xl font-semibold"> Welcome back </h1>
                <p className="text-sm text-muted-foreground">
                  Login to your Lifeing account
                </p>
              </div>
              <FormMessage message={searchParams} />
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="email@email.com"
                  className="text-sm"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm hover-underline text-primary"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="*********"
                  className="text-sm"
                  required
                />
              </div>
              <SubmitButton className="w-full" pendingText="Logging in...">
                Login
              </SubmitButton>
              {/* TODO: Finalize SSO/Social Login */}
              {/* <div className="relative text-sm text-center after:absolute after:inset-0  after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="text-muted-foreground relative z-10 bg-background px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-2">
                <Button variant="outline">
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Facebook</title>
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                  </svg>
                  Login with Facebook
                </Button>
              </div> */}
              <div className="text-center text-sm mt-10">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
