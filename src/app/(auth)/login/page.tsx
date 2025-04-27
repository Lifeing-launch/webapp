import { LoginForm } from "@/components/auth/login-form";
import Testimonials from "@/components/auth/testimonials";
import React from "react";

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-4xl gap-6">
      <LoginForm />
      <Testimonials />
    </div>
  );
}
