"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppFeature {
  id: number;
  title: string;
  image: string;
}

const appFeatures: AppFeature[] = [
  {
    id: 1,
    title: "Join Daily Live Meetings directly from your dashboard",
    image: "/images/landing/app-features-1.png",
  },
  {
    id: 2,
    title: 'Bookmark and Store Resources in your personal "Living Room"',
    image: "/images/landing/app-features-1.png",
  },
  {
    id: 3,
    title: "Stream and Save Audio Tools like meditations and podcasts",
    image: "/images/landing/app-features-1.png",
  },
  {
    id: 4,
    title: "Contribute to the Community Forum or join private groups",
    image: "/images/landing/app-features-1.png",
  },
];

const AppFeatures = () => {
  const [selectedFeature, setSelectedFeature] = useState<number>(1);

  const feature = appFeatures.find((f) => f.id === selectedFeature);

  return (
    <div className="p-0 md:px-6 md:py-24">
      <section className="bg-[#42104C] md:rounded-[30px] p-8 pr-0 md:p-16 md:pr-0 overflow-hidden">
        <div>
          {/* Header Section */}
          <div className="text-center mb-12 pr-8 md:pr-16 max-w-7xl">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-tight tracking-tight">
              Lifeing is Your Digital Sanctuary
            </h2>
            <p className="text-xl md:text-2xl text-[#EAE1ED] max-w-4xl mx-auto leading-relaxed">
              Everything we do is housed within an intuitive, beautifully
              designed platform made to support your personal growth. Your
              membership unlocks access to a secure and private web application
              where you can:
            </p>
          </div>

          {/* Interactive Features Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
            {/* Features List */}
            <div className="space-y-0 pr-8 md:pr-16 order-2 lg:order-1">
              {appFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className={cn(
                    "cursor-pointer transition-all duration-500 ease-in-out p-6 transform",
                    selectedFeature === feature.id
                      ? "border-l-4 border-[#71277F] bg-white/10 shadow-lg scale-[1.02]"
                      : "border-l-4 border-[#42104C] opacity-50 hover:opacity-75 hover:bg-white/5"
                  )}
                  onClick={() => setSelectedFeature(feature.id)}
                >
                  <p
                    className={cn(
                      "text-lg md:text-xl leading-relaxed transition-all duration-300 text-[#EAE1ED]",
                      selectedFeature === feature.id && "font-medium"
                    )}
                  >
                    {feature.title}
                  </p>
                </div>
              ))}
            </div>

            {/* Feature Image */}
            <div className="relative lg:mr-[-2rem] order-1 lg:order-2">
              <div className="relative w-full h-[300px] md:h-[400px] lg:h-[586px] rounded-l-[20px] overflow-hidden shadow-2xl">
                <Image
                  src={feature?.image || appFeatures[0].image}
                  alt={feature?.title || appFeatures[0].title}
                  fill
                  className="object-cover object-left transition-all duration-700 ease-in-out transform"
                  priority
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AppFeatures;
