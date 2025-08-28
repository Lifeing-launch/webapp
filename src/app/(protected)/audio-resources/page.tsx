"use client";

import React from "react";
import ResourcesContent from "@/components/resources/content";
import "../../globals.css";
import PageBanner from "@/components/layout/page-banner";
import { useSectionColors } from "@/hooks/use-section-colors";

const BANNER_IMAGE = "/images/banners/audio-resources.png";
type TabKey = "all" | "meditation" | "podcast" | "relaxation" | "bookmark";

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "meditation", label: "Meditation" },
  { key: "podcast", label: "Podcast" },
  { key: "relaxation", label: "Relaxation" },
  { key: "bookmark", label: "Bookmarked" },
];

const AudioResourcesPage = () => {
  const { colors } = useSectionColors();

  return (
    <div
      className="w-full h-screen flex flex-col"
      style={
        {
          "--section-bookmark-color": colors.primary,
        } as React.CSSProperties
      }
    >
      <PageBanner
        title="Audio Library"
        className="mb-0 flex-shrink-0"
        backgroundImage={BANNER_IMAGE}
      />
      <main className="flex-1 p-4 overflow-y-auto">
        <ResourcesContent<TabKey> tabs={tabs} category="audio" />
      </main>
    </div>
  );
};

export default AudioResourcesPage;
