"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
    image: "/images/landing/app-features-2.png",
  },
  {
    id: 3,
    title: "Stream and Save Audio Tools like meditations and podcasts",
    image: "/images/landing/app-features-3.png",
  },
  {
    id: 4,
    title: "Contribute to the Community Forum or join private groups",
    image: "/images/landing/app-features-4.png",
  },
];

const AppFeatures = () => {
  const [selectedFeature, setSelectedFeature] = useState<number>(1);

  const feature = appFeatures.find((f) => f.id === selectedFeature);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const headerVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
      },
    },
  };

  const featureItemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const imageVariants = {
    hidden: { x: 50, opacity: 0, scale: 0.9 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <motion.div
      className="p-0 lg:px-6 lg:py-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <section className="bg-[#42104C] lg:rounded-[30px] p-8 md:p-12 lg:p-16 lg:pr-0 overflow-hidden">
        <div>
          {/* Header Section */}
          <motion.div
            className="text-center mb-12 lg:pr-16 max-w-7xl"
            variants={headerVariants}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-gilda text-white mb-8 leading-tight tracking-tight"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Lifeing is Your Online Sanctuary
            </motion.h2>
            <motion.p
              className="text-xl md:text-2xl text-[#EAE1ED] max-w-4xl mx-auto leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Everything we do is housed within an intuitive, beautifully
              designed platform made to support your personal growth. Your
              membership unlocks access to a secure and private web application
              where you can:
            </motion.p>
          </motion.div>

          {/* Interactive Features Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
            {/* Features List */}
            <motion.div
              className="space-y-0 lg:pr-16 order-2 lg:order-1"
              variants={containerVariants}
            >
              {appFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  className={cn(
                    "cursor-pointer transition-all duration-500 ease-in-out p-6 transform",
                    selectedFeature === feature.id
                      ? "border-l-10 border-[#71277F]"
                      : "border-l-10 border-[#42104C] opacity-75"
                  )}
                  onClick={() => setSelectedFeature(feature.id)}
                  variants={featureItemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  animate={
                    selectedFeature === feature.id ? "selected" : "initial"
                  }
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.p
                    className={cn(
                      "text-lg md:text-xl leading-relaxed transition-all duration-300 text-[#EAE1ED]",
                      selectedFeature === feature.id &&
                        "font-medium text-xl md:text-2xl"
                    )}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    {feature.title}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>

            {/* Feature Image */}
            <motion.div
              className="relative lg:mr-[-2rem] order-1 lg:order-2"
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="relative w-full h-[300px] md:h-[400px] lg:h-[586px] lg:rounded-l-[20px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedFeature}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={feature?.image || appFeatures[0].image}
                      alt={feature?.title || appFeatures[0].title}
                      fill
                      className="object-contain lg:object-cover lg:object-left"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default AppFeatures;
