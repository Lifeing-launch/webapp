"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ContentSection } from "@/typing/retreats";
import { cn } from "@/lib/utils";

interface ContentImageSectionProps {
  data: ContentSection;
}

export default function ContentImageSection({
  data,
}: ContentImageSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!data.images || data.images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % data.images.length);
        setIsTransitioning(false);
      }, 300);
    }, data.imageSlideInterval || 5000);

    return () => clearInterval(interval);
  }, [data.images, data.imageSlideInterval]);

  const isLeftAligned = data.alignment === "left";

  return (
    <section className="py-16 px-4">
      <div className="mx-auto">
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center",
            !isLeftAligned && "lg:flex-row-reverse"
          )}
        >
          {/* Text Content */}
          <div
            className={cn(
              "space-y-6",
              !isLeftAligned ? "lg:order-2" : "lg:order-1"
            )}
          >
            <h2 className="font-gilda font-normal text-3xl text-[#1C1C1C] leading-tight">
              {data.title}
            </h2>
            <div className="space-y-4">
              <p
                className="font-schibsted font-normal text-lg text-[#1C1C1C] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            </div>
          </div>

          {/* Image Container */}
          <div
            className={cn(
              "relative h-[350px] md:h-[400px] lg:h-[450px] rounded-[20px] overflow-hidden",
              !isLeftAligned ? "lg:order-1" : "lg:order-2"
            )}
          >
            <div className="relative w-full h-full bg-gray-100">
              {data.images && data.images.length > 0 ? (
                data.images.map((image, index) => (
                  <Image
                    key={image}
                    src={image}
                    alt={`${data.title} - Image ${index + 1}`}
                    fill
                    className={cn(
                      "object-cover transition-opacity duration-700",
                      index === currentImageIndex ? "opacity-100" : "opacity-0",
                      isTransitioning &&
                        index === currentImageIndex &&
                        "opacity-0"
                    )}
                    priority={index === 0}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">No images available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
