"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { RetreatCarousel } from "@/typing/retreats";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  data: RetreatCarousel;
}

export default function ImageCarousel({ data }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

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
    <>
      <section className="py-16 px-4">
        <div className="mx-auto">
          <div className="relative">
            {/* Main carousel container */}
            <div 
              className="w-full h-[440px] relative rounded-[20px] overflow-hidden cursor-zoom-in"
              onClick={() => setIsZoomed(true)}
            >
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
              
              {/* Navigation arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-7 top-1/2 -translate-y-1/2 size-14 bg-stone-400 rounded-[30px] hover:bg-stone-500 transition-colors overflow-hidden"
                aria-label="Previous image"
              >
                <div className="relative w-full h-full flex justify-center items-center">
                  <ChevronLeft className="w-6 h-6 text-zinc-900" />
                </div>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-7 top-1/2 -translate-y-1/2 size-14 bg-stone-400 rounded-[30px] hover:bg-stone-500 transition-colors overflow-hidden"
                aria-label="Next image"
              >
                <div className="relative w-full h-full flex justify-center items-center">
                  <ChevronRight className="w-6 h-6 text-zinc-900" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 size-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setIsZoomed(false)}
            aria-label="Close zoom"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <Image
              src={data.images[currentIndex]}
              alt={`Retreat gallery ${currentIndex + 1} - Zoomed`}
              width={1200}
              height={800}
              className="object-contain"
              priority
            />
            
            {/* Navigation in zoom mode */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 size-14 bg-white/10 hover:bg-white/20 rounded-[30px] transition-colors flex items-center justify-center"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 size-14 bg-white/10 hover:bg-white/20 rounded-[30px] transition-colors flex items-center justify-center"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
