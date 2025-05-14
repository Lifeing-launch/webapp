"use client";

import React from "react";
import { Card, CardContent } from "../../ui/card";
import { FormMessage } from "../../form/message";
import Link from "next/link";
import { Button } from "../../ui/button";

const ResetPasswordVerification = ({ error }: { error: string }) => {
  return (
    <div className="w-full">
      <Card>
        <CardContent>
          <div className="flex flex-col gap-9">
            <h1 className="text-2xl font-semibold">Reset Your Password</h1>
            <FormMessage message={{ error }} />
            <Button asChild className="w-full">
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordVerification;
