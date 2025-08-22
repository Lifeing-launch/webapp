"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/components/providers/user-provider";
import PageBanner from "@/components/layout/page-banner";
import QUOTES from "./quotes.json";

const QUOTE_TIMEOUT = 20000;

export default function DashboardBanner() {
  const { profile, loading } = useUser();
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Cycle through quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((idx) => (idx + 1) % QUOTES.length);
    }, QUOTE_TIMEOUT);
    return () => clearInterval(interval);
  }, []);

  const bannerUrl =
    profile?.dashboard_cover_img || "/images/banners/dashboard.jpg";
  const greetingSuffix = profile?.first_name ? `, ${profile.first_name}` : "";
  const quote = QUOTES[quoteIdx];

  if (loading) {
    return (
      <div className="relative w-full h-48 md:h-64 overflow-hidden flex items-end mb-6">
        <div className="absolute inset-0 bg-muted" />
      </div>
    );
  }

  return (
    <PageBanner
      title={`Welcome to Lifeing${greetingSuffix}`}
      subtitle={
        <>
          {quote.quote} <br />
          <span className="not-italic">– {quote.author}</span>
        </>
      }
      backgroundImage={bannerUrl}
      className="mb-6 flex-shrink-0"
    />
  );
}
