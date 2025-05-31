import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import React from "react";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import ResourcesContent from "@/components/resources/content";
import "../../globals.css";

const breadcrumbs: Breadcrumb[] = [{ label: "Audio Resources" }];

type TabKey = "all" | "meditation" | "podcast" | "relaxation" | "bookmarks";

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "meditation", label: "Meditation" },
  { key: "podcast", label: "Podcast" },
  { key: "relaxation", label: "Relaxation" },
  { key: "bookmarks", label: "Bookmarked" },
];

const AudioResourcesPage = () => {
  return (
    <PageTemplate
      title="Audio Resources"
      breadcrumbs={breadcrumbs}
      headerIcon={sidebarIcons.podcast}
      searchProps={{
        label: "Search resources",
      }}
    >
      <ResourcesContent<TabKey>
        fetchUrl="/api/resources"
        tabs={tabs}
        resourceGroup="audio"
      />
    </PageTemplate>
  );
};

export default AudioResourcesPage;
