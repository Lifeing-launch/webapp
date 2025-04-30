import VerifyEmailForm from "@/components/auth/verify-email-form";
import { AuthPageProps } from "@/typing/interfaces";

import React from "react";

const Page = async (props: AuthPageProps) => {
  const searchParams = await props.searchParams;

  return (
    <div className="flex w-full max-w-sm gap-6">
      <VerifyEmailForm searchParams={searchParams} />
    </div>
  );
};

export default Page;
