import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import React from "react";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import ResourcesContent from "@/components/resources/content";

const breadcrumbs: Breadcrumb[] = [{ label: "Resources" }];

type TabKey = "all" | "articles" | "videos" | "documents" | "bookmarks";
const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "All Resources" },
  { key: "articles", label: "Articles" },
  { key: "videos", label: "Videos" },
  { key: "documents", label: "Documents" },
  { key: "bookmarks", label: "Bookmarked" },
];

const ResourcesPage = () => {
  return (
    <PageTemplate
      title="Resources"
      breadcrumbs={breadcrumbs}
      headerIcon={sidebarIcons.podcast}
      searchProps={{
        label: "Search resources",
      }}
    >
      <ResourcesContent<TabKey> fetchUrl="/api/resources" tabs={tabs} />
    </PageTemplate>
  );
};

export default ResourcesPage;
