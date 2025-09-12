"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RetreatCarousel } from "@/typing/retreats";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  data: RetreatCarousel;
}

export default function ImageCarousel({ data }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(
        (prev) => (prev - 1 + data.images.length) % data.images.length
      );
      setIsTransitioning(false);
    }, 200);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % data.images.length);
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <section className="py-16 px-4">
      <div className="mx-auto">
        <div className="relative">
          {/* Main carousel container */}
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-[20px] overflow-hidden">
            <div className="relative w-full h-full bg-gray-100">
              {data.images.map((image, index) => (
                <Image
                  key={image}
                  src={image}
                  alt={`Retreat gallery ${index + 1}`}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-500",
                    index === currentIndex ? "opacity-100" : "opacity-0",
                    isTransitioning && index === currentIndex && "opacity-0"
                  )}
                  priority={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </div>
    </section>
  );
}
