import Plans from "@/components/subscription/plans";
import { Card, CardContent } from "@/components/ui/card";
import { SignoutButton } from "@/components/auth/signout-button";
import { FREE_TRIAL_DAYS } from "@/utils/constants";
import React from "react";

const Page = () => {
  return (
    <div className="flex w-full max-w-6xl">
      <div className="w-full">
        <Card className="relative">
          <SignoutButton className="absolute right-2 top-2 h-8 w-8 rounded-full z-10" />
          <CardContent className="flex flex-col gap-9">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-semibold">Select Your Plan</h1>
              <p className="text-sm text-muted-foreground">
                Free for the first {FREE_TRIAL_DAYS} days. Cancel anytime.
              </p>
            </div>
            <Plans />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
