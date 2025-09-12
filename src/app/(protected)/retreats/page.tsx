import React from "react";
// import PageTemplate from "@/components/layout/page-template";
import PageBanner from "@/components/layout/page-banner";
import RetreatPageContent from "@/components/retreats/RetreatPageContent";
import { RetreatData } from "@/typing/retreats";
import { Metadata } from "next";
import { serverFetch } from "@/utils/fetch";

async function getRetreatData(): Promise<RetreatData> {
  const data = await serverFetch("/api/retreats");
  return data;
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getRetreatData();
    return {
      title: data.seo.title,
      description: data.seo.description,
    };
  } catch {
    return {
      title: "Lifeing Retreats",
      description: "Join our transformative wellness retreats",
    };
  }
}

export default async function RetreatsPage() {
  const data = await getRetreatData();

  return (
    <>
      <PageBanner
        title="Retreats"
        backgroundImage="/images/retreats/banner.png"
        height="lg"
        imagePosition="50% 70%"
      />

      <div className="w-full h-full flex flex-col flex-1">
        <RetreatPageContent data={data} />
      </div>
    </>
  );
}
