"use client";

import React, { ReactNode, useEffect, useState, useRef } from "react";
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

const BASE_HEIGHTS = {
  sm: { min: 80, max: 128, mdMin: 100, mdMax: 160 },
  md: { min: 120, max: 200, mdMin: 150, mdMax: 280 },
  lg: { min: 160, max: 256, mdMin: 200, mdMax: 320 },
};

const VIEWPORT_RATIO = {
  mobile: 0.25,
  tablet: 0.3,
  desktop: 0.35,
};

const DEFAULT_BANNER = "/images/banners/dashboard.jpg";

export default function PageBanner({
  title,
  subtitle,
  backgroundImage = DEFAULT_BANNER,
  height = "md",
  className = "",
}: PageBannerProps) {
  const { state, isMobile } = useSidebar();
  const [bannerHeight, setBannerHeight] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const showTrigger = state === "collapsed" || isMobile;
  const baseHeight = BASE_HEIGHTS[height];

  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let ratio = VIEWPORT_RATIO.desktop;
      let maxHeight = baseHeight.mdMax;
      let minHeight = baseHeight.mdMin;

      if (viewportWidth < 768) {
        ratio = VIEWPORT_RATIO.mobile;
        maxHeight = baseHeight.max;
        minHeight = baseHeight.min;
      } else if (viewportWidth < 1024) {
        ratio = VIEWPORT_RATIO.tablet;
      }

      const calculatedHeight = Math.min(viewportHeight * ratio, maxHeight);
      const finalHeight = Math.max(calculatedHeight, minHeight);

      return isScrolled ? minHeight : finalHeight;
    };

    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    const handleResize = () => {
      setBannerHeight(calculateHeight());
    };

    setBannerHeight(calculateHeight());
    handleResize();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [height, isScrolled, baseHeight]);

  return (
    <div
      ref={bannerRef}
      className={`relative w-full overflow-hidden flex items-end transition-all duration-300 ease-in-out ${className}`}
      style={{
        height: bannerHeight ? `${bannerHeight}px` : undefined,
      }}
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
