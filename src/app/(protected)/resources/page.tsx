"use client";

import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import React, { useEffect, useState } from "react";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import ResourcesSkeleton from "@/components/resources/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Resource, ResourceCard } from "@/components/resources/resource-card";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { PaginationWithLinks } from "@/components/ui/custom/pagination-with-links";
import { PARAM_KEY_SEARCH } from "@/components/layout/page-search";
import { toast } from "sonner";
import qs from "qs";
import { StrapiMeta } from "@/typing/global";

type TabKey = "all" | "articles" | "videos" | "documents" | "bookmarks";

const breadcrumbs: Breadcrumb[] = [{ label: "Resources" }];
const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "All Resources" },
  { key: "articles", label: "Articles" },
  { key: "videos", label: "Videos" },
  { key: "documents", label: "Documents" },
  { key: "bookmarks", label: "Bookmarked" },
];

const PARAM_KEY_PAGE = "page";
const PARAM_KEY_TAB = "tab";

const PAGE_SIZE = 10;
const VALID_TABS: Set<TabKey> = new Set([
  "all",
  "articles",
  "videos",
  "documents",
  "bookmarks",
]);

const ResourcesPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const page = Number(searchParams.get(PARAM_KEY_PAGE)) || 1;
  const tab = searchParams.get(PARAM_KEY_TAB) || "all";
  const searchQuery = searchParams.get(PARAM_KEY_SEARCH);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      const query = qs.stringify({
        page,
        q: searchQuery,
        type: tab === "all" ? undefined : tab,
      });
      const res = await fetch(`/api/resources?${query}`);
      const data: { data?: Resource[]; error?: string; meta: StrapiMeta } =
        await res.json();
      if (data.error) {
        toast.error(data.error);
      }

      setResources(data?.data || []);
      setTotalCount(data?.meta?.pagination.total || 0);
      setIsLoading(false);
    };

    fetchResources();
  }, [tab, searchQuery, page]);

  console.log(page, tab, searchQuery, resources);

  const onTabChange = (tabKey: string) => {
    const newSearchParams = new URLSearchParams(searchParams);

    // Set the current tab
    if (tabKey === "all") {
      newSearchParams.delete(PARAM_KEY_TAB);
    } else {
      newSearchParams.set(PARAM_KEY_TAB, tabKey);
    }

    newSearchParams.delete(PARAM_KEY_PAGE); // Clear the page number when changing page size
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  let content = <></>;

  if (isLoading) {
    content = <ResourcesSkeleton />;
  } else {
    content = (
      <>
        {tabs.map((tab) => (
          <TabsContent value={tab.key} key={tab.key} className="space-y-4">
            {!resources.length ? (
              <p className="text-sm"> There are no resources to display.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 auto-rows-fr">
                {resources.map((resource) => (
                  <ResourceCard
                    resource={resource}
                    key={resource.id}
                    hasBookmarked={!!Math.round(Math.random())}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
        {!!totalCount && (
          <div className="mb-10">
            <PaginationWithLinks
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <PageTemplate
      title="Resources"
      breadcrumbs={breadcrumbs}
      headerIcon={sidebarIcons.resources}
      searchProps={{
        label: "Search resources",
      }}
    >
      <div className="flex flex-col flex-1 gap-4 p-4 pt-0 w-full h-full lg:flex-row">
        <Tabs
          defaultValue="all"
          value={VALID_TABS.has(tab as TabKey) ? tab : "all"}
          className="space-y-4 w-full"
        >
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger
                value={tab.key}
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {content}
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default ResourcesPage;
