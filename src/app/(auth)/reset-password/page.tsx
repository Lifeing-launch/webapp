import React from "react";
import ResetPasswordForm from "@/components/auth/reset-password/form";
import { AuthPageProps } from "@/typing/interfaces";

const Page = async (props: AuthPageProps) => {
  const searchParams = await props.searchParams;

  return (
    <div className="flex w-full max-w-sm gap-6">
      <ResetPasswordForm searchParams={searchParams} />
    </div>
  );
};

export default Page;
