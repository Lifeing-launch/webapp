import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import React from "react";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import { notFound } from "next/navigation";
import { serverFetch } from "@/utils/fetch";
import { Coach } from "@/typing/strapi";
import { ExtendedBioRenderer } from "@/components/coaching/ExtendedBioRenderer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarHeart, ChevronLeft, HeartHandshake } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ICoachProfilePage {
  params: Promise<{ id: string }>;
}

export default async function CoachProfilePage({ params }: ICoachProfilePage) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  try {
    const data: { data?: Coach } = await serverFetch(
      `/api/coaches/${id}/details`
    );
    const coach = data.data;

    if (!coach) {
      notFound();
    }

    const breadcrumbs: Breadcrumb[] = [
      { label: "Coaching", href: "/coaching" },
      { label: coach.name || "" },
    ];

    return (
      <PageTemplate
        breadcrumbs={breadcrumbs}
        headerIcon={sidebarIcons.coachingProgram}
      >
        <div className="max-w-4xl mx-auto mt-10">
          <Link
            href="/coaching"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Coaches
          </Link>

          {/* Header with coach info */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start mt-6">
            {coach.avatar && (
              <div className="w-32 h-32 overflow-hidden rounded-full flex-shrink-0">
                <Image
                  src={coach.avatar.url}
                  className="object-cover w-full h-full"
                  alt={coach.name}
                  width={128}
                  height={128}
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-center md:text-left">
                {coach.name}
              </h1>
              <p className="text-gray-600 mt-2 text-center md:text-left">
                {coach.summary}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="size-5 text-primary" />
                  <span>{coach.focus_areas.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarHeart className="size-5 text-primary" />
                  <span>{coach.experience_in_years}+ years experience</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href={coach.booking_url} target="_blank" rel="noreferrer">
                  <Button>Book a session</Button>
                </Link>
              </div>
            </div>
          </div>

          <Separator />

          {/* Extended bio */}
          {coach.extended_bio && (
            <div className="mt-8 prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">
                About {coach.name.split(" ")[0]}
              </h2>
              <ExtendedBioRenderer blocks={coach.extended_bio} />
            </div>
          )}
        </div>
      </PageTemplate>
    );
  } catch (error) {
    console.error("Error fetching coach profile:", error);
    return (
      <PageTemplate
        breadcrumbs={[{ label: "Coaching", href: "/coaching" }]}
        headerIcon={sidebarIcons.coachingProgram}
      >
        <div className="py-10">
          <Link
            href="/coaching"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Coaches
          </Link>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Unable to load coach profile
            </h2>
            <p className="mb-6">
              There was an error loading this coach&apos;s profile. Please try
              again later.
            </p>
            <Link href="/coaching">
              <Button>Return to Coaches</Button>
            </Link>
          </div>
        </div>
      </PageTemplate>
    );
  }
}
