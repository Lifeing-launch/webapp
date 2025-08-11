import React from "react";
import ResourcesContent from "@/components/resources/content";
import PageBanner from "@/components/layout/page-banner";

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
  return (
    <div className="w-full">
      <PageBanner
        title="Library"
        className="mb-0"
        backgroundImage={BANNER_IMAGE}
      />
      <main className="p-4">
        <ResourcesContent<TabKey> tabs={tabs} />
      </main>
    </div>
  );
};

export default ResourcesPage;
