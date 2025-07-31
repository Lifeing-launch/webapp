"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CLOUDINARY_UPLOAD_CONFIG,
  UploadWidget,
} from "../cloudinary/upload-widget";
import { createClient } from "@/utils/supabase/browser";
import { UserProfile } from "@/typing/supabase";
import Image from "next/image";
import { Button } from "../ui/button";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_BANNER = "/dashboard-banner.jpg";
const QUOTES = [
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
  },
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
];

export default function DashboardBanner() {
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const uploadWidgetRef = useRef<() => void | null>(null);

  // Helper to fetch and set profile safely
  const fetchAndSetProfile = async () => {
    const supabase = createClient();

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        throw new Error(authError.message);
      }

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("first_name, dashboard_cover_img")
        .eq("id", authData.user.id)
        .single()
        .throwOnError();

      setProfile(profileData);
    } catch (error) {
      console.error(error);
      setProfile({ first_name: "", dashboard_cover_img: null });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user profile
  useEffect(() => {
    fetchAndSetProfile();
  }, []);

  // Cycle through quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((idx) => (idx + 1) % QUOTES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleChangeCover = () => {
    if (uploadWidgetRef.current) uploadWidgetRef.current();
  };

  // Placeholder for upload handler
  const handleUpload = async (image: { url: string }) => {
    try {
      const response = await fetch("/api/dashboard-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: image.url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update cover image");
      }

      toast.success("Cover image updated!");
      setProfile({ ...profile, dashboard_cover_img: image.url });
      await fetchAndSetProfile();
    } catch (error) {
      console.error("Error updating cover image:", error);
      toast.error("Failed to update cover image");
    }
  };

  const bannerUrl = profile?.dashboard_cover_img || DEFAULT_BANNER;
  const greetingSuffix = profile?.first_name ? `, ${profile.first_name}` : "";
  const quote = QUOTES[quoteIdx];

  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden flex items-end mb-6">
      {isLoading ? (
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
      <Button
        className="absolute top-4 right-4 z-20 bg-#000 text-white"
        onClick={handleChangeCover}
        variant="outline"
      >
        <ImageIcon /> Change Cover
      </Button>

      <div className="relative z-10 p-6 md:p-10 text-white w-full flex flex-col md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2 drop-shadow">
            Welcome to Lifeing{greetingSuffix}
          </h1>
          <p className="italic text-sm drop-shadow max-w-2xl">
            {quote.text} <br />
            <span className="not-italic">– {quote.author}</span>
          </p>
        </div>
        <UploadWidget
          onUpload={handleUpload}
          ref={uploadWidgetRef}
          config={CLOUDINARY_UPLOAD_CONFIG.dashboardBanner}
        />
      </div>
    </div>
  );
}
