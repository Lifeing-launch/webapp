import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import React from "react";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import ResourcesContent from "@/components/resources/content";

const breadcrumbs: Breadcrumb[] = [{ label: "Resources" }];

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
    <PageTemplate
      title="Resources"
      breadcrumbs={breadcrumbs}
      headerIcon={sidebarIcons.podcast}
      searchProps={{
        label: "Search resources",
      }}
    >
      <ResourcesContent<TabKey> tabs={tabs} />
    </PageTemplate>
  );
};

export default ResourcesPage;
