import { LoginForm } from "@/components/auth/login/form";
import { AuthPageProps } from "@/typing/interfaces";
import React from "react";

export default async function LoginPage(props: AuthPageProps) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex w-full max-w-5xl gap-6">
      <LoginForm searchParams={searchParams} />
    </div>
  );
}
