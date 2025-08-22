"use client";

import { useState } from "react";
import Image from "next/image";
import { MoveLeft, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Ross Alexgunder",
    role: "Artist",
    quote:
      "Lifeing's coaching has transformed my approach to wellness. I feel empowered and supported every step of the way!",
    avatar: "/images/landing/placeholder-reviewer.png",
  },
  {
    id: 2,
    name: "Oliviya Gomage",
    role: "Designer",
    quote:
      "The community here is incredible. I've found genuine connections and support that I never thought possible online.The community here is incredible. I've found genuine connections and support that I never thought possible online.The community here is incredible. I've found genuine connections and support that I never thought possible online.The community here is incredible. I've found genuine connections and support that I never thought possible online.",
    avatar: "/images/landing/placeholder-reviewer.png",
  },
  {
    id: 3,
    name: "Sarah Chen",
    role: "Teacher",
    quote:
      "Lifeing has given me the tools and confidence to make lasting changes in my life. The coaches are truly amazing.",
    avatar: "/images/landing/placeholder-reviewer.png",
  },
  {
    id: 4,
    name: "Michael Rodriguez",
    role: "Engineer",
    quote:
      "I was skeptical at first, but Lifeing has completely changed my perspective on personal growth and wellness.",
    avatar: "/images/landing/placeholder-reviewer.png",
  },
  {
    id: 5,
    name: "Emma Thompson",
    role: "Nurse",
    quote:
      "The daily meetings and resources have become an essential part of my routine. I'm so grateful for this community.",
    avatar: "/images/landing/placeholder-reviewer.png",
  },
  {
    id: 6,
    name: "David Kim",
    role: "Entrepreneur",
    quote:
      "Lifeing provides the perfect balance of structure and flexibility. It's exactly what I needed for my wellness journey.",
    avatar: "/images/landing/placeholder-reviewer.png",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const titleVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const testimonialVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  const renderTestimonials = ({
    cardPercentage = 50,
    prevSlideDisabled = false,
    nextSlideDisabled = false,
  }) => {
    return (
      <>
        <div className="overflow-hidden">
          <div
            className={`flex transition-transform duration-500 ease-in-out`}
            style={{
              transform: `translateX(-${currentIndex * cardPercentage}%)`,
            }}
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                className="w-full px-4 flex-shrink-0"
                style={{ maxWidth: `${cardPercentage}%` }}
                variants={testimonialVariants}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <div className="relative rounded-[20px] p-8 flex flex-col">
                  {/* Quote Icon Background */}
                  <div className="absolute top-0 left-0 justify-center">
                    <Image
                      src="/images/landing/quotes.svg"
                      alt="Quote background"
                      width={232}
                      height={196}
                      className="w-full h-full object-contain max-w-[180px]"
                    />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full gap-5">
                    {/* Avatar and Info */}
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-gilda text-[#18181B] mb-2">
                          {testimonial.name}
                        </h3>
                        <p className="text-lg text-[#3F3F46]">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>

                    {/* Quote */}
                    <div>
                      <p className="text-lg text-[#3F3F46] leading-relaxed">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center mt-8 lg:justify-end lg:absolute lg:bottom-0 lg:right-0 lg:mt-0">
          <motion.button
            onClick={prevSlide}
            disabled={prevSlideDisabled}
            aria-label="Previous testimonial"
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 mr-4",
              prevSlideDisabled
                ? "bg-[#D1D5DB] cursor-not-allowed"
                : "bg-[#ADC178] hover:bg-[#9BB86A] cursor-pointer"
            )}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <MoveLeft className="w-4 h-4 text-[#18181B]" />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            aria-label="Next testimonial"
            disabled={nextSlideDisabled}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200",
              nextSlideDisabled
                ? "bg-[#D1D5DB] cursor-not-allowed"
                : "bg-[#ADC178] hover:bg-[#9BB86A] cursor-pointer"
            )}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            viewport={{ once: true }}
          >
            <MoveRight className="w-4 h-4 text-[#18181B]" />
          </motion.button>
        </div>
      </>
    );
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-6 py-24 relative">
        {/* Section Title */}
        <motion.div
          className="max-w-3xl mb-12"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-gilda text-[#18181B] mb-8 leading-tight tracking-tight"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Real Stories of Transformation and Growth from Those We Have Helped
          </motion.h2>
        </motion.div>
        <div className="hidden lg:block">
          {renderTestimonials({
            cardPercentage: 50,
            prevSlideDisabled: currentIndex === 0,
            nextSlideDisabled: currentIndex >= testimonials.length - 2,
          })}
        </div>

        <div className="block lg:hidden">
          {renderTestimonials({
            cardPercentage: 100,
            prevSlideDisabled: currentIndex === 0,
            nextSlideDisabled: currentIndex >= testimonials.length - 1,
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default Testimonials;
