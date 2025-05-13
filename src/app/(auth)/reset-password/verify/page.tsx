"use client";

import React, { useEffect, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/browser";
import { getAuthErrorMessage } from "@/utils/supabase/errors";
import { LoadingSpinner } from "@/components/loading-spinner";
import ResetPasswordVerification from "@/components/auth/reset-password-verification";

const Page = () => {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token_hash = searchParams.get("th");
    const type = searchParams.get("type");

    const supabase = createClient();

    if (!token_hash || type !== "recovery") {
      setError("Invalid or expired reset link");
      return;
    }

    const verify = async () => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: "recovery",
      });

      if (error) {
        const message = getAuthErrorMessage(error.code, error);
        setError(message);
        return;
      }

      redirect("/reset-password");
    };

    verify();
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex w-full max-w-sm gap-6">
        <ResetPasswordVerification error={error} />
      </div>
    );
  }

  return <LoadingSpinner />;
};

export default Page;
