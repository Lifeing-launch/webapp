"use client";

import { motion } from "framer-motion";

const VideoMessage = () => {
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
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
      },
    },
  };

  const videoVariants = {
    hidden: { x: 50, opacity: 0, scale: 0.9 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const paragraphVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
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
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="bg-[#46611E] rounded-3xl p-12 md:p-16"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          whileInView={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              className="text-white"
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="space-y-6 text-lg leading-relaxed">
                <motion.p
                  variants={paragraphVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  We meet people where they are. We walk beside them. And we
                  support change that lasts because it&apos;s built on
                  self-compassion, not willpower.
                </motion.p>
                <motion.p
                  variants={paragraphVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  Lifeing exists because health behavior change isn&apos;t about
                  fixing people, it&apos;s about walking with them. Most people
                  struggling with unhealthy coping strategies, alcohol,
                  relationships, or emotional pain don&apos;t need more
                  discipline, they need more compassionate presence,
                  understanding, and support.
                </motion.p>
                <motion.p
                  variants={paragraphVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                >
                  We believe people can rewrite their stories not by following
                  rigid rules, but by reconnecting to themselves, others, and
                  the deeper &ldquo;why&rdquo; behind their choices.
                </motion.p>
              </div>
            </motion.div>

            {/* Video Player */}
            <motion.div
              className="relative"
              variants={videoVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
            >
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-800/50">
                <iframe
                  src="https://drive.google.com/file/d/1TESS-XNf4ubstpUKPAoEiKTDCkc15wqu/preview"
                  title="Lifeing Video Message"
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default VideoMessage;
