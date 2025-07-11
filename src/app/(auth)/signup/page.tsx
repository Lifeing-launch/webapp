import { SignupForm } from "@/components/auth/signup/form";
import Testimonials from "@/components/auth/testimonials";
import { AuthPageProps } from "@/typing/interfaces";
import React from "react";

const Page = async (props: AuthPageProps) => {
  const searchParams = await props.searchParams;

  return (
    <div className="flex w-full max-w-5xl gap-6">
      <SignupForm searchParams={searchParams} />
      <Testimonials isSignup />
    </div>
  );
};

export default Page;
