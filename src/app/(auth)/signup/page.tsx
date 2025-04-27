import { SignupForm } from "@/components/auth/signup-form";
import Testimonials from "@/components/auth/testimonials";
import React from "react";

const Page = () => {
  return (
    <div className="flex w-full max-w-4xl gap-6">
      <SignupForm />
      <Testimonials />
    </div>
  );
};

export default Page;
