"use client";

import ErrorTemplate from "@/components/layout/error";
import React from "react";

export default function ErrorPage() {
  return (
    <ErrorTemplate
      heading="Something went wrong 😔"
      description="Sorry, looks like there was an unexpected error. Please try again later or contact support if the issue persists."
      className="bg-purple-50"
    />
  );
}
