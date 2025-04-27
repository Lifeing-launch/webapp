import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col flex-1", className)} {...props}>
      <Card>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1 items-center">
                <h1 className="text-2xl font-semibold">Create Your Account</h1>
                <p className="text-sm text-muted-foreground">
                  Start Your 10-Day Free Trial
                </p>
              </div>
              <div className="flex gap-4">
                <div className="grid gap-2 w-full">
                  <Label htmlFor="firstname">First Name</Label>
                  <Input
                    id="firstname"
                    type="firstname"
                    name="firstname"
                    placeholder="Lorem"
                    required
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2 w-full">
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input
                    id="lastname"
                    type="lastname"
                    name="lastname"
                    placeholder="Ipsum"
                    required
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="email@email.com"
                  required
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  className="text-sm"
                />
              </div>
              <Button> Continue </Button>
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
                <a href="#" className="underline">
                  Log in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
