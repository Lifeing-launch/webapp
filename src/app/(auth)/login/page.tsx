import { LoginForm } from "@/components/auth/login/form";
import Testimonials from "@/components/auth/testimonials";
import { AuthPageProps } from "@/typing/interfaces";
import React from "react";

export default async function LoginPage(props: AuthPageProps) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex w-full max-w-4xl gap-6">
      <LoginForm searchParams={searchParams} />
      <Testimonials />
    </div>
  );
}
