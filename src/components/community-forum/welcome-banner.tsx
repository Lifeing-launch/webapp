import React from "react";
import PageBanner from "@/components/layout/page-banner";

const BANNER_IMAGE = "/images/banners/lifeing-lounge.png";

/**
 * Welcome Banner Component for Community Forum
 */
export function WelcomeBanner() {
  return (
    <PageBanner
      title="Welcome to the Lifeing Lounge"
      subtitle="This is a safe space to connect with other Lifeing community members anonymously. Share thoughts, progress, and milestones."
      className="mb-0"
      backgroundImage={BANNER_IMAGE}
    />
  );
}
