import React from "react";
import ResourcesContent from "@/components/resources/content";
import "../../globals.css";
import PageBanner from "@/components/layout/page-banner";

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
  return (
    <div className="w-full h-screen flex flex-col">
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
