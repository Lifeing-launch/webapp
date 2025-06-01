import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import React from "react";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import { notFound } from "next/navigation";
import { Resource } from "@/components/resources/resource-card";
import { Article } from "@/components/resources/article";
import { cookies } from "next/headers";
import { getSiteUrl } from "@/utils/urls";

interface IResourcesPage {
  params: { slug: string };
}

const ResourcesPage = async ({ params }: IResourcesPage) => {
  const { slug } = await params;

  const res = await fetch(`${getSiteUrl()}/api/resources/${slug}`, {
    headers: {
      cookie: (await cookies()).toString(),
    },
    cache: "no-cache",
  });

  if (!res.ok) {
    notFound();
  }

  const data: { data?: Resource; error?: string } = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.data?.length) {
    notFound();
  }

  const breadcrumbs: Breadcrumb[] = [
    { label: "Articles", href: "/resources?tab=article" },
    { label: data.data[0].title || "" },
  ];

  return (
    <PageTemplate breadcrumbs={breadcrumbs} headerIcon={sidebarIcons.podcast}>
      <Article resource={data.data[0]} />
    </PageTemplate>
  );
};

export default ResourcesPage;
