import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import React from "react";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import { notFound } from "next/navigation";
import { Article } from "@/components/resources/article";
import { createClient } from "@/utils/supabase/server";
import { Resource } from "@/typing/strapi";
import { serverFetch } from "@/utils/fetch";

interface IResourcesPage {
  params: Promise<{ slug: string }>;
}

const ResourcesPage = async ({ params }: IResourcesPage) => {
  const { slug } = await params;
  const data: { data?: Resource[] } = await serverFetch(
    `/api/resources/${slug}`
  );

  if (!data.data?.length) {
    notFound();
  }

  let hasBookmarked = false;
  const resource = data.data[0];
  const breadcrumbs: Breadcrumb[] = [
    { label: "Articles", href: "/resources?tab=article" },
    { label: resource.title || "" },
  ];

  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(`Unauthorized: ${userError?.message || ""}`);
    }

    const { data: bookmark, error: bookmarkError } = await supabase
      .from("bookmarks")
      .select("resource_id")
      .eq("user_id", user.id)
      .eq("resource_id", resource.id)
      .limit(1)
      .maybeSingle();

    if (bookmarkError) {
      throw new Error(`Bookmark error: ${bookmarkError.message || ""}`);
    }

    if (bookmark) {
      hasBookmarked = true;
    }
  } catch (err) {
    // Fail silently
    console.error("An error occurred fetching article bookmark", err);
  }

  return (
    <PageTemplate breadcrumbs={breadcrumbs} headerIcon={sidebarIcons.podcast}>
      <Article resource={resource} hasBookmarked={hasBookmarked} />
    </PageTemplate>
  );
};

export default ResourcesPage;
