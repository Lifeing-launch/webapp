"use client";

import React from "react";
import ResourcesContent from "@/components/resources/content";
import PageBanner from "@/components/layout/page-banner";
import { useSectionColors } from "@/hooks/use-section-colors";

const BANNER_IMAGE = "/images/banners/resources.png";

type TabKey = "all" | "article" | "video" | "document" | "bookmark";
const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "All Resources" },
  { key: "article", label: "Articles" },
  { key: "video", label: "Videos" },
  { key: "document", label: "Documents" },
  { key: "bookmark", label: "Bookmarked" },
];

const ResourcesPage = () => {
  const { colors } = useSectionColors();

  return (
    <div
      className="w-full h-full flex flex-col"
      style={
        {
          "--section-bookmark-color": colors.primary,
        } as React.CSSProperties
      }
    >
      <PageBanner
        title="Library"
        className="mb-0 flex-shrink-0"
        backgroundImage={BANNER_IMAGE}
      />
      <main className="flex-1 p-4 overflow-y-auto">
        <ResourcesContent<TabKey> tabs={tabs} />
      </main>
    </div>
  );
};

export default ResourcesPage;
