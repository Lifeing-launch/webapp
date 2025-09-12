"use client";

import React from "react";
import AnnouncementSection from "./AnnouncementSection";
import ContentImageSection from "./ContentImageSection";
import RetreatRoomsSection from "./RetreatRoomsSection";
import ImageCarousel from "./ImageCarousel";
import PricingSection from "./PricingSection";
import { RetreatData } from "@/typing/retreats";

interface RetreatPageContentProps {
  data: RetreatData;
}

export default function RetreatPageContent({ data }: RetreatPageContentProps) {
  const handleSeeRoomRates = () => {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBookingClick = () => {
    if (data.bookingUrl) {
      window.open(data.bookingUrl, "_blank");
    }
  };

  return (
    <div className="bg-white px-10 pb-40">
      <AnnouncementSection
        data={data.announcement}
        onCtaClick={handleSeeRoomRates}
      />

      {data.contentSections.map((section) => (
        <ContentImageSection key={section.id} data={section} />
      ))}

      <RetreatRoomsSection
        data={data.retreatRooms}
        onBookingClick={handleBookingClick}
      />

      <ImageCarousel data={data.carousel} />

      <PricingSection data={data.pricing} onBookingClick={handleBookingClick} />
    </div>
  );
}
