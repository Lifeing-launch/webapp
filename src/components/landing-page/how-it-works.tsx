"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MousePointerClick, CheckCircle, Sun } from "lucide-react";
import Link from "next/link";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Choose your membership",
      description:
        "Sign up and start your 21-day free trial. No pressure. No rush.",
      icon: <MousePointerClick className="w-11 h-11 text-white" />,
    },
    {
      id: 2,
      title: "Get Access",
      description:
        "Attend a session, read an article, or just sit with your thoughts.",
      icon: <CheckCircle className="w-11 h-11 text-white" />,
    },
    {
      id: 3,
      title: "Show up!",
      description:
        "Whether you prefer to read quietly, listen to meditations, or join group chats",
      icon: <Sun className="w-11 h-11 text-white" />,
    },
  ];

  return (
    <section className="bg-[#AC5118] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-white font-serif text-5xl md:text-6xl leading-tight tracking-tight mb-8">
            How It Works
          </h2>
        </div>

        {/* Steps Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {steps.map((step) => (
            <div
              key={step.id}
              className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center aspect-square"
            >
              {/* Icon Container */}
              <div className="w-20 h-20 bg-[#F0915A] rounded-full flex items-center justify-center mb-6">
                {step.icon}
              </div>

              {/* Step Title */}
              <h3 className="text-[#18181B] font-serif text-2xl leading-tight tracking-tight mb-4">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-[#3F3F46] font-schibsted text-lg leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link href="/signup">
            <Button className="bg-[#F0915A] hover:bg-[#F0915A]/90 text-white font-schibsted font-bold text-base p-6 rounded-lg transition-colors duration-300">
              Start your 21-day free trial
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
