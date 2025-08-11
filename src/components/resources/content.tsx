"use client";

import React, { useEffect, useState } from "react";
import ResourcesSkeleton from "@/components/resources/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceCard } from "@/components/resources/resource-card";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { PaginationWithLinks } from "@/components/ui/custom/pagination-with-links";
import { PageSearch, PARAM_KEY_SEARCH } from "@/components/layout/page-search";
import { toast } from "sonner";
import qs from "qs";
import { StrapiMeta } from "@/typing/global";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/providers/user-provider";
import { createClient } from "@/utils/supabase/browser";
import { Resource, ResourceCategory } from "@/typing/strapi";

const PARAM_KEY_PAGE = "page";
const PARAM_KEY_TAB = "tab";

const PAGE_SIZE = 10;

type EnrichedResource = Resource & { hasBookmarked?: boolean };

interface IResourceContent<TabType> {
  category?: ResourceCategory;
  tabs: { key: TabType; label: string }[];
}

const ResourcesContent = <TabType extends string>({
  tabs,
  category = "visual",
}: IResourceContent<TabType>) => {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState<EnrichedResource[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const page = Number(searchParams.get(PARAM_KEY_PAGE)) || 1;
  const tab = (searchParams.get(PARAM_KEY_TAB) || "all") as TabType;
  const searchQuery = searchParams.get(PARAM_KEY_SEARCH);

  const validTabs = new Set(tabs.map((tab) => tab.key));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (userLoading) {
          return;
        }

        if (!user) {
          throw new Error("Unauthorized");
        }

        const supabase = createClient();
        const query = qs.stringify({
          page,
          pageSize: PAGE_SIZE,
          q: searchQuery,
          type: tab === "all" ? undefined : tab,
          category,
        });
        const res = await fetch(`/api/resources?${query}`);
        const data: { data?: Resource[]; error?: string; meta: StrapiMeta } =
          await res.json();

        if (data.error) {
          throw new Error(data.error);
        } else {
          const resources = data.data;

          // Fetch bookmarks for the current user
          const { data: bookmarks } = await supabase
            .from("bookmarks")
            .select("resource_id")
            .eq("user_id", user.id);

          // Map bookmark data to resources
          const bookmarkedResourceIds = new Set(
            bookmarks
              ?.map((bookmark: { resource_id: number | null }) =>
                Number(bookmark.resource_id)
              )
              .filter((id) => !isNaN(id))
          );
          const enrichedResources = (resources || []).map((resource) => ({
            ...resource,
            hasBookmarked: bookmarkedResourceIds.has(resource.id),
          }));

          setResources(enrichedResources || []);
          setTotalCount(data?.meta?.pagination.total || 0);
        }
      } catch (err) {
        console.error("Error fetching resources: ", err);
        toast.error("Error fetching resources");
        setResources([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tab, searchQuery, page, category, user, userLoading]);

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

  if (isLoading || userLoading) {
    content = <ResourcesSkeleton />;
  } else {
    content = (
      <>
        {tabs.map((tab) => (
          <TabsContent value={tab.key} key={tab.key} className="space-y-4">
            {!resources.length ? (
              <p className="text-sm"> There are no resources to display.</p>
            ) : (
              <div
                className={cn(
                  "grid auto-rows-fr gap-4 grid-cols-1 md:grid-cols-2 ",
                  category === "audio" && "lg:grid-cols-3"
                )}
              >
                {resources.map((resource) => (
                  <ResourceCard
                    resource={resource}
                    key={resource.id}
                    hasBookmarked={resource.hasBookmarked}
                    category={category}
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
    <div className="flex flex-col flex-1 gap-4 p-4 pt-0 w-full h-full lg:flex-row">
      <Tabs
        defaultValue="all"
        value={validTabs.has(tab) ? tab : "all"}
        className="space-y-4 w-full"
      >
        <div className="flex flex-row gap-4 items-center justify-between">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger
                value={tab.key}
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className="cursor-pointer"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <PageSearch label="Search library" />
        </div>
        {content}
      </Tabs>
    </div>
  );
};

export default ResourcesContent;
