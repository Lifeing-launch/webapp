"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Choose your membership",
      description:
        "Sign up and start your 21-day free trial. No pressure. No rush.",
      icon: (
        <Image
          src="/images/landing/how-it-works-choose.svg"
          className="w-40 h-40"
          alt=""
          width={44}
          height={44}
        />
      ),
    },
    {
      id: 2,
      title: "Get Access",
      description:
        "Attend a session, read an article, or just sit with your thoughts.",
      icon: (
        <Image
          src="/images/landing/how-it-works-access.svg"
          className="w-40 h-40"
          alt=""
          width={44}
          height={44}
        />
      ),
    },
    {
      id: 3,
      title: "Show up!",
      description:
        "Whether you prefer to read quietly, listen to meditations, or join group chats",
      icon: (
        <Image
          src="/images/landing/how-it-works-show.svg"
          className="w-40 h-40"
          alt=""
          width={44}
          height={44}
        />
      ),
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
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

  const stepVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const ctaVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 1.2,
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

  return (
    <motion.section
      className="bg-[#AC5118] py-16 px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div className="text-center mb-16" variants={headerVariants}>
          <motion.h2
            className="text-white font-gilda text-5xl md:text-6xl leading-tight tracking-tight mb-8"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
        </motion.div>

        {/* Steps Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center lg:aspect-square"
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{
                y: -10,
                transition: { duration: 0.3 },
              }}
            >
              {/* Icon Container */}
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1 + 0.5,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                viewport={{ once: true }}
              >
                {step.icon}
              </motion.div>

              {/* Step Title */}
              <motion.h3
                className="text-[#18181B] font-gilda text-2xl leading-tight tracking-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.7 }}
                viewport={{ once: true }}
              >
                {step.title}
              </motion.h3>

              {/* Step Description */}
              <motion.p
                className="text-[#3F3F46] font-schibsted text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.9 }}
                viewport={{ once: true }}
              >
                {step.description}
              </motion.p>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          className="text-center"
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link href="/signup">
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button className="bg-[#F0915A] hover:bg-[#F0915A]/90 text-white font-schibsted font-bold text-base p-6 rounded-lg transition-colors duration-300">
                Start your 21-day free trial
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;
