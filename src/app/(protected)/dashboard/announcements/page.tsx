"use client";

import {
  Announcement,
  AnnouncementItem,
} from "@/components/dashboard/announcements";
import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import { AnnouncementSkeleton } from "@/components/dashboard/skeleton";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "@/typing/strapi";

const breadcrumbs: Breadcrumb[] = [
  { label: "Living Room", href: "/dashboard" },
  { label: "Announcements" },
];

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [metadata, setMetadata] = useState<Metadata>();

  const pageRef = useRef(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsMoreLoading(true);
      const page = pageRef.current;
      const res = await fetch(`/api/announcements?page=${page}`);
      const data: { data?: Announcement[]; meta: Metadata; error?: string } =
        await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const allAnnouncements = [...announcements, ...(data?.data || [])];
      setAnnouncements(allAnnouncements);
      setMetadata(data.meta);

      pageRef.current = page + 1;
    } catch (err) {
      toast.error("Error fetching announcements");
      console.error("Error fetching announcements: ", err);
    } finally {
      setIsMoreLoading(false);
    }
  }, [announcements]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAnnouncements();
      setIsLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expectedPages = metadata?.pagination?.pageCount || 0;

  let content = <></>;

  if (isLoading) {
    content = <AnnouncementSkeleton />;
  } else {
    content = (
      <>
        {announcements.length ? (
          <section>
            <div>
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex border-b last:border-b-0 py-4"
                >
                  <Megaphone width={30} className="text-primary mt-0 mr-2" />
                  <AnnouncementItem announcement={announcement} />
                </div>
              ))}
            </div>

            {expectedPages >= pageRef.current && (
              <Button
                className="w-full cursor-pointer"
                variant="secondary"
                onClick={fetchAnnouncements}
                disabled={isMoreLoading}
              >
                {isMoreLoading ? "Loading more..." : "Load more"}
              </Button>
            )}
          </section>
        ) : (
          <p className="text-sm"> There are no new announcements</p>
        )}
      </>
    );
  }

  return (
    <PageTemplate
      title="Announcements"
      breadcrumbs={breadcrumbs}
      headerIcon={<Megaphone />}
    >
      <div className="flex flex-col w-full h-full">{content}</div>
    </PageTemplate>
  );
};

export default AnnouncementsPage;
