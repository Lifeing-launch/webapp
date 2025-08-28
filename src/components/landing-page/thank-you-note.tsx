"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const ThankYouNote = () => {
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

  const heartVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const textVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const dividerVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.2,
      },
    },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          className="bg-white rounded-3xl p-16 shadow-lg"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          whileInView={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Top Row of Hearts */}
          <motion.div
            className="flex justify-center gap-2 mb-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                variants={heartVariants}
                whileHover={{
                  scale: 1.2,
                  rotate: 10,
                  transition: { duration: 0.3 },
                }}
              >
                <Heart className="w-10 h-10 text-[#F6F0ED]" fill="#F6F0ED" />
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="text-center max-w-4xl mx-auto mb-8"
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl font-gilda text-[#18181B] mb-8 leading-tight"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              A Heartfelt Thank You
            </motion.h2>
            <motion.p
              className="text-xl text-[#3F3F46] leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Launching Lifeing was a dream rooted in compassion and growth,
              made possible by the unwavering belief and support of very special
              individuals. We extend our deepest gratitude to our Board of
              Directors: Karl Rogers, Leigh Holman, and Joe Maxwell.
              <br />
              <br />
              Your generous gifts of time, wisdom, and friendship have been
              invaluable. Karl and Joe, your instrumental financial support has
              helped turn our vision into a reality. Leigh, your consistent
              commitment to the daily work has been a constant source of
              guidance and encouragement. Your collective partnership has truly
              been incredible.
            </motion.p>
          </motion.div>

          {/* Divider Line */}
          <motion.div
            className="w-80 h-px bg-[#F6F0ED] mx-auto mb-8"
            variants={dividerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          />

          {/* Second Section */}
          <motion.div
            className="text-center max-w-4xl mx-auto mb-8"
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl font-gilda text-[#18181B] mb-6 leading-tight"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
            >
              And to Our Cherished Community Members
            </motion.h2>
            <motion.p
              className="text-xl text-[#3F3F46] leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              viewport={{ once: true }}
            >
              We are profoundly grateful for your trust. You joined us for one
              meeting that launched a movement, and your belief in us has been
              the foundation of our growth. Your incredible patience, kindness,
              and unwavering presence have made this community-based platform
              possible.
              <br />
              <br />
              From the bottom of our hearts, thank you all. We are so proud to
              have you on this journey with us.
              <br />
              <br />
              We Love You All,
              <br />
              Heidi & Lisa Marie
            </motion.p>
          </motion.div>

          {/* Bottom Row of Hearts */}
          <motion.div
            className="flex justify-center gap-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                variants={heartVariants}
                whileHover={{
                  scale: 1.2,
                  rotate: -10,
                  transition: { duration: 0.3 },
                }}
              >
                <Heart className="w-10 h-10 text-[#F6F0ED]" fill="#F6F0ED" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ThankYouNote;
