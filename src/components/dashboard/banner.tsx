"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/components/providers/user-provider";
import Image from "next/image";
import QUOTES from "./quotes.json";

const DEFAULT_BANNER = "/dashboard-banner.jpg";
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

  const bannerUrl = profile?.dashboard_cover_img || DEFAULT_BANNER;
  const greetingSuffix = profile?.first_name ? `, ${profile.first_name}` : "";
  const quote = QUOTES[quoteIdx];

  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden flex items-end mb-6">
      {loading ? (
        <div className="absolute inset-0 bg-muted" />
      ) : (
        <Image
          src={bannerUrl}
          alt="Dashboard Cover"
          fill
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 p-6 md:p-8 text-white w-full flex flex-col md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-4 drop-shadow">
            Welcome to Lifeing{greetingSuffix}
          </h1>
          <p className="italic text-sm drop-shadow max-w-2xl">
            {quote.quote} <br />
            <span className="not-italic">– {quote.author}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
