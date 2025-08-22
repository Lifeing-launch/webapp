"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const FoundersMessage = () => {
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

  const textVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
      },
    },
  };

  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -5 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const quoteVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.4,
      },
    },
  };

  const foundersVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.7,
      },
    },
  };

  return (
    <motion.section
      className="py-20 px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
        {/* Text Content */}
        <motion.div
          className="flex-1 text-center"
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.blockquote
            className="font-gilda text-2xl text-[#18181B] mb-6 leading-snug"
            variants={quoteVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            &ldquo;We have created Lifeing from a deep, shared need for a
            different kind of space. This is where the pressure to hustle, hide,
            or perform simply melts away. It&apos;s a gentle invitation to
            simply be, to connect, and to practice being authentically human,
            together.&rdquo;
          </motion.blockquote>
          <motion.div
            className="font-schibsted text-lg text-[#3F3F46]"
            variants={foundersVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Co-Founders
          </motion.div>
          <motion.div
            className="font-schibsted text-lg text-[#3F3F46]"
            variants={foundersVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Dr. Lisa Marie Jones and Heidi Blair, CPCC
          </motion.div>
        </motion.div>

        {/* Image */}
        <motion.div
          className="flex-1 flex justify-center"
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{
            scale: 1.05,
            rotate: 2,
            transition: { duration: 0.3 },
          }}
        >
          <div className="w-80 h-80 rounded-full overflow-hidden">
            <Image
              src="/images/landing/founders.png"
              alt="Founders of Lifeing"
              width={320}
              height={320}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FoundersMessage;
