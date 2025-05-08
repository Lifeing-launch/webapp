import { Message } from "@/components/auth/form-message";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { setPasswordRecoverySessionAction } from "@/utils/supabase/actions";
import React from "react";

type SupabaseResetParams = {
  access_token?: string;
  refresh_token?: string;
  type?: string;
  error_code?: string;
  error_description?: string;
};

interface ResetPasswordPageProps {
  searchParams: Promise<SupabaseResetParams & Message>;
}

const Page = async (props: ResetPasswordPageProps) => {
  const searchParams = await props.searchParams;

  const { access_token, refresh_token, type } = searchParams;

  // Log the searchParams for debugging
  console.log("searchParams:", searchParams);

  // Set the password recovery session if the tokens are present
  if (access_token && refresh_token && type === "recovery") {
    await setPasswordRecoverySessionAction(access_token, refresh_token, type);
  }

  return (
    <div className="flex w-full max-w-sm gap-6">
      <ResetPasswordForm searchParams={searchParams} />
    </div>
  );
};

export default Page;
