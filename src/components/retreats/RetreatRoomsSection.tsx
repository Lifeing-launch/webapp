"use client";

import React from "react";
import { RetreatRoomsInfo } from "@/typing/retreats";

interface RetreatRoomsSectionProps {
  data: RetreatRoomsInfo;
  onBookingClick?: () => void;
}

export default function RetreatRoomsSection({
  data,
  onBookingClick,
}: RetreatRoomsSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 items-start">
          {/* Title */}
          <h2 className="font-gilda font-normal text-3xl text-[#1C1C1C] whitespace-nowrap">
            {data.title}
          </h2>

          {/* Content */}
          <div className="flex-1 space-y-8">
            {data.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="font-schibsted font-normal text-lg text-[#1C1C1C] leading-relaxed"
              >
                {paragraph}
              </p>
            ))}

            <p className="font-schibsted font-normal text-lg text-[#1C1C1C] italic">
              {data.footnote}
            </p>

            <button
              onClick={onBookingClick}
              className="bg-retreat-button hover:bg-retreat-button-hover text-white px-8 py-3 font-schibsted font-medium text-lg rounded-[10px] transition-colors"
            >
              {data.ctaText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
