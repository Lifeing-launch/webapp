"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const Footnote = () => {
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

  const buttonVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 1.2,
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.section
      className="bg-[#42104C] py-20 px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          className="text-white space-y-8"
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="space-y-6 text-xl md:text-2xl lg:text-3xl leading-tight font-gilda">
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Connection is a basic human need, and in a time where we have
              become disconnected by the digital world, it makes sense that we
              now use this virtual ecosystem to regain what&apos;s been lost and
              can now be accessible to all.
            </motion.p>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: true }}
            >
              And science backs this up: In essence, our brains are wired for
              connection, and while face-to-face interaction offers the richest
              array of cues (body language, tone, etc.), online communities can
              effectively tap into these innate needs, triggering the release of
              beneficial neurochemicals and contributing to our overall mental
              and emotional well-being.
            </motion.p>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              viewport={{ once: true }}
            >
              We are a community where true connection is happening everyday,
              where we are free, safe, learning and growing as individuals, and
              even as friends. Come as you are ~ Grow as you are ready
            </motion.p>
          </div>

          <motion.div
            className="pt-4"
            variants={buttonVariants}
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
                <Button className="bg-white hover:bg-gray-100 text-[#42104C] font-schibsted font-bold text-base px-8 py-6 rounded-lg transition-colors duration-300">
                  Start your 21-day free trial
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Footnote;
