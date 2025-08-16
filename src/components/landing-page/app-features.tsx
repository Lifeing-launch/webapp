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
    image: "/images/landing/app-features-meetings.png",
  },
  {
    id: 2,
    title: 'Bookmark and Store Resources in your personal "Living Room"',
    image: "/images/landing/app-features-meetings.png",
  },
  {
    id: 3,
    title: "Stream and Save Audio Tools like meditations and podcasts",
    image: "/images/landing/app-features-meetings.png",
  },
  {
    id: 4,
    title: "Contribute to the Community Forum or join private groups",
    image: "/images/landing/app-features-meetings.png",
  },
];

const AppFeatures = () => {
  const [selectedFeature, setSelectedFeature] = useState<number>(1);

  return (
    <section className="bg-[#42104C] rounded-[30px] pl-16 pt-16 pb-16">
      <div className="max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12 pr-16">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-tight tracking-tight">
            Lifeing is Your Digital Sanctuary
          </h2>
          <p className="text-xl md:text-2xl text-[#EAE1ED] max-w-4xl mx-auto leading-relaxed">
            Everything we do is housed within an intuitive, beautifully designed
            platform made to support your personal growth. Your membership
            unlocks access to a secure and private web application where you
            can:
          </p>
        </div>

        {/* Interactive Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Features List */}
          <div className="space-y-0 pr-16">
            {appFeatures.map((feature) => (
              <div
                key={feature.id}
                className={cn(
                  "cursor-pointer transition-all duration-500 ease-in-out p-6 rounded-lg transform hover:scale-[1.02]",
                  selectedFeature === feature.id
                    ? "border-l-4 border-[#71277F] bg-white/10 shadow-lg"
                    : "border-l-4 border-[#42104C] opacity-50 hover:opacity-75 hover:bg-white/5"
                )}
                onClick={() => setSelectedFeature(feature.id)}
              >
                <p
                  className={cn(
                    "text-lg md:text-xl leading-relaxed transition-all duration-300",
                    selectedFeature === feature.id
                      ? "text-[#EAE1ED] font-medium"
                      : "text-[#EAE1ED]"
                  )}
                >
                  {feature.title}
                </p>
              </div>
            ))}
          </div>

          {/* Feature Image */}
          <div className="relative lg:mr-[-2rem]">
            <div className="relative w-full h-[586px] rounded-l-[20px] overflow-hidden shadow-2xl">
              <Image
                src={
                  appFeatures.find((f) => f.id === selectedFeature)?.image ||
                  appFeatures[0].image
                }
                alt="App Feature Preview"
                fill
                className="object-cover transition-all duration-700 ease-in-out transform hover:scale-105"
                priority
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppFeatures;
