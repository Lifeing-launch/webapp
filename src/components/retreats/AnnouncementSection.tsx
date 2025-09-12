"use client";

import React from "react";
import { RetreatAnnouncement } from "@/typing/retreats";

interface AnnouncementSectionProps {
  data: RetreatAnnouncement;
  onCtaClick?: () => void;
}

export default function AnnouncementSection({
  data,
  onCtaClick,
}: AnnouncementSectionProps) {
  // Parse the description to format the date in bold
  const formatDescription = (desc: string) => {
    // Split into sentences for better formatting
    const sentences = desc.split(". ");
    const firstPart = sentences[0]; // Contains the date part
    const secondPart = sentences[1]; // Contains the second sentence

    // Format the first sentence with bold date
    const formattedFirst = firstPart.replace(
      "October 30th to November 3rd",
      "<strong>October 30th to November 3rd</strong>"
    );

    return { formattedFirst, secondPart };
  };

  const { formattedFirst, secondPart } = formatDescription(data.description);

  return (
    <section className="py-12">
      <div className="mx-auto">
        <div className="bg-[#F5F4F0] rounded-[20px] py-16 px-8 md:px-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Title */}
            <h2 className="font-gilda font-normal text-3xl md:text-4xl text-[#1C1C1C] mb-6 leading-tight">
              {data.title}
            </h2>

            {/* Subtitle */}
            <h1 className="font-gilda font-normal text-3xl md:text-4xl text-[#1C1C1C] mb-12 leading-tight">
              {data.subtitle}
            </h1>

            {/* Description with formatted date */}
            <div className="mb-12 space-y-6">
              <p
                className="font-schibsted font-normal text-lg text-[#1C1C1C] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formattedFirst + "." }}
              />
              {secondPart && (
                <p className="font-schibsted font-normal text-lg text-[#1C1C1C] leading-relaxed">
                  {secondPart}.
                </p>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={onCtaClick}
              className="bg-retreat-button hover:bg-retreat-button-hover text-white px-10 py-4 font-schibsted font-medium text-lg rounded-[10px] transition-colors"
            >
              {data.ctaText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
