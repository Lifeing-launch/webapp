import VerifyEmailForm from "@/components/auth/verify-email-form";
import { getSecureCookie, VERIFICATION_EMAIL_COOKIE } from "@/utils/cookies";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  // Check if the verification email cookie is set
  const email = await getSecureCookie(VERIFICATION_EMAIL_COOKIE);

  // Redirect to login if the cookie is missing
  if (!email) {
    redirect("/login");
  }

  return (
    <div className="flex w-full max-w-sm gap-6">
      <VerifyEmailForm />
    </div>
  );
};

export default Page;
