"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

interface PageBannerProps {
  title: string;
  subtitle?: ReactNode;
  backgroundImage?: string;
  height?: "sm" | "md" | "lg";
  className?: string;
}

const HEIGHT_CLASSES = {
  sm: "h-32 md:h-40",
  md: "h-50 md:h-70",
  lg: "h-64 md:h-80",
};

const DEFAULT_BANNER = "/images/banners/dashboard.jpg";

export default function PageBanner({
  title,
  subtitle,
  backgroundImage = DEFAULT_BANNER,
  height = "md",
  className = "",
}: PageBannerProps) {
  const heightClass = HEIGHT_CLASSES[height];
  const { state, isMobile } = useSidebar();

  const showTrigger = state === "collapsed" || isMobile;

  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden flex items-end ${className}`}
    >
      <Image
        src={backgroundImage}
        alt="Page Banner"
        fill
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/30" />

      {showTrigger && (
        <div className="absolute top-4 left-4 z-20">
          <SidebarTrigger
            icon={<Menu className="text-white size-5" />}
            className="hover:bg-primary"
          />
        </div>
      )}

      <div className="relative z-10 p-6 md:p-8 text-white w-full flex flex-col md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-4 drop-shadow">{title}</h1>
          {subtitle && (
            <p className="italic text-sm drop-shadow max-w-2xl">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
