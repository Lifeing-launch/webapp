"use client";

import PageBanner from "@/components/layout/page-banner";
import { useSectionColors } from "@/hooks/use-section-colors";
import { ReactElement } from "react";

const BANNER_IMAGE = "/images/banners/book-club.png";

export default function BookClubContent({
  content,
}: {
  content: ReactElement;
}) {
  const { colors } = useSectionColors();

  return (
    <div
      className="w-full h-screen flex flex-col"
      style={
        {
          "--section-bookmark-color": colors.primary,
        } as React.CSSProperties
      }
    >
      <PageBanner
        title="Shelf discovery with Meg"
        className="mb-0 flex-shrink-0"
        backgroundImage={BANNER_IMAGE}
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-xl text-sm flex flex-col gap-4 mb-5">
          <p className="font-bold">
            Join Meg for Shelf Discovery, Lifeings Book Club where we explore
            thought-provoking reads and the ideas that expand our minds and
            hearts.
          </p>
          <p>
            This new journey begins with a “Surprise”, Meg will introduce the
            book during the first meeting. Bring your curiosity and Meg will
            bring a thought provoking question and we will all share in a
            lively, engaging discussion.
          </p>
          <p className="text-muted-foreground text-xs">
            Stay tuned for updates, links for the books and more information as
            we roll out this exciting new offering!
          </p>
          <div className="mt-5">{content}</div>
        </div>
      </main>
    </div>
  );
}
