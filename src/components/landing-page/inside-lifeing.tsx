"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MoveLeft, MoveRight } from "lucide-react";

interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  image: string;
}

const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    title: "Gentle Support from Experienced Guides",
    description:
      "Our compassionate coaches are here to walk alongside you, offering understanding and encouragement every step of the way.",
    image: "/images/landing/inside-lifeing-1.png",
  },
  {
    id: 2,
    title: "Tools and Topics to Meet You Where You Are",
    description:
      "Discover practical tools, thoughtful topics and prompts designed to resonate with your unique journey and provide personal insights.",
    image: "/images/landing/inside-lifeing-2.png",
  },
  {
    id: 3,
    title: "Live Sessions and Community Connection",
    description:
      "Join our daily live Zoom meetings and hang out in our community lounge. It's a great way to connect with others in real-time and find your sense of belonging through shared experiences.",
    image: "/images/landing/inside-lifeing-3.png",
  },
  {
    id: 4,
    title: "A Calm Space to Just Be",
    description:
      "This is your sanctuary—a place where there's no need for fixing, no external pressure, just the freedom to simply exist and explore.",
    image: "/images/landing/inside-lifeing-4.png",
  },
  {
    id: 5,
    title: "A Robust Resource Library",
    description:
      "Dive into a rich collection of resources curated to support your well-being and personal development. Browse hundreds of topical documents, assessments, and info graphics. Listen to guided meditations, educational articles, essays and stories.",
    image: "/images/landing/inside-lifeing-5.png",
  },
  {
    id: 6,
    title: "All In One Place",
    description:
      'Welcome to your "Living Room" a customizable private storage hub where you can quickly access your gathered resources; documents, audios, quotes, logs, goals, reading list, journal, meeting links and more.',
    image: "/images/landing/inside-lifeing-6.png",
  },
];

const InsideLifeing = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        // nextSlide();
      }
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, isTransitioning]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(
      (prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (slideIndex: number) => {
    if (isTransitioning || slideIndex === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(slideIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <section className="bg-[#F6F7F6] py-24">
      <div className="max-w-7xl mx-auto lg:px-6">
        {/* Header */}
        <div className="text-center mb-16 px-6 lg:px-0">
          <h2 className="text-4xl md:text-5xl font-serif text-[#18181B] mb-8 leading-tight tracking-tight">
            What You&apos;ll Find Inside Lifeing
          </h2>
          <p className="text-xl md:text-2xl text-[#3F3F46] max-w-4xl mx-auto leading-relaxed">
            At Lifeing, we offer a nurturing environment designed to support
            your personal growth without pressure or judgment. Here&apos;s a
            glimpse of what awaits you:
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Carousel Content */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out pb-12"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {carouselSlides.map((slide, index) => (
                <div key={slide.id} className="w-full flex-shrink-0">
                  <div className="flex flex-col lg:flex-row items-center">
                    {/* Image */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-2 lg:ml-[-2%]">
                      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[692px] lg:rounded-[20px] overflow-hidden">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          priority={index === currentSlide}
                        />
                        {/* Overlay for better text readability */}
                        <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                    </div>

                    {/* Text Content - Green Box */}
                    <div className="w-full required: lg:w-1/2 z-20 order-2 lg:order-1">
                      <div className="bg-[#46611E] lg:rounded-[20px] p-8 md:p-12 lg:p-16 text-white relative">
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif mb-8 leading-tight tracking-tight">
                          {slide.title}
                        </h3>
                        <p className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-8">
                          {slide.description}
                        </p>

                        {/* Navigation Arrows at bottom of green box */}
                        <div className="flex justify-center space-x-4 absolute bottom-[-28px] left-0 right-0 lg:left-auto lg:right-14">
                          <button
                            onClick={prevSlide}
                            className="w-16 h-16 bg-[#ADC178] rounded-full flex items-center justify-center lg:shadow-lg hover:bg-[#ADC178]/90 transition-colors duration-300"
                            aria-label="Previous slide"
                          >
                            <MoveLeft className="w-4 h-4 text-[#18181B]" />
                          </button>

                          <button
                            onClick={nextSlide}
                            className="w-16 h-16 bg-[#ADC178] rounded-full flex items-center justify-center lg:shadow-lg hover:bg-[#ADC178]/90 transition-colors duration-300"
                            aria-label="Next slide"
                          >
                            <MoveRight className="w-4 h-4 text-[#18181B]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  index === currentSlide
                    ? "bg-[#46611E] scale-125"
                    : "bg-[#ADC178] hover:bg-[#46611E]/70"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsideLifeing;
