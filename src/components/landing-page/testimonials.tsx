"use client";

import { useState } from "react";
import Image from "next/image";
import { MoveLeft, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Mary Jo aka MJ",
    role: "",
    quote:
      "The Lifeing community is like nothing I've experienced in my 60+ years of life. The experiences and stories shared are so relatable and the coaches' reflections are gold. It's a space to be vulnerable without fear of judgment or criticism. We learn and grow together; the love, support, tears, and laughs are magical. It really is difficult to describe what this community provides and means to me. Thanks a million!",
  },
  {
    id: 2,
    name: "Robenett",
    role: "",
    quote:
      "Lifeing has been a platform that has done nothing but enhance my very life. Two years ago I made a major permanent lifestyle commitment that was centered around learning how to mindfully moderate my alcohol consumption. It has enabled me to carry this way of living into other parts of myself. Learning to live with intention, compassion, and self understanding while in community with others on the same path, has served as a motivator for me. Lifeing is a lifestyle community where each person presents from a place of vulnerability and truthfulness which makes for such an honest and enriching experience. It makes becoming a better version of yourself a natural outcome. One thing I have learned and will carry with me forever is that seeking self belief leads to acknowledgement, which leads to honesty, which leads to motivation, which leads to uncovering your true self. That my friend, is a WIN!",
  },
  {
    id: 3,
    name: "Yo so Vida",
    role: "",
    quote:
      "For a long, long time I didn't know how lost and misguided I was. When I discovered and was lead to the coaching and guidance of Heidi and Dr Lovey, I started my journey to freedom, liberation, and self discovery. Their compassion, support and encouragement was pivotal in my healing my inner most wounds and reclaiming my birthright; grow and move forward towards becoming the individual i was created to be. With the tools they offered and the ongoing support, I started on a trajectory that has truly changed my life for the better. I now have an expansive perspective on life. They helped me find my voice, feel my feels with a confidence and defiance I never knew possible. I am the risen phoenix and am eternally grateful to both of these amazing humans.",
  },
  {
    id: 4,
    name: "Lauren InTheNow",
    role: "",
    quote:
      "Lifeing has been a game changer! Not because I've figured everything out, but because I've learned how to keep showing up for myself without getting stuck in shame or self-sabotage. It's given me tools, perspective, and a supportive space to keep doing the work, one step at a time. I'm still growing, still learning, but now I do it with compassion and clarity instead of fear. That shift has made all the difference.",
  },
  {
    id: 5,
    name: "Sunny",
    role: "",
    quote:
      "Lifeing has literally changed my life! I've been on other platforms before, and nothing has come close to the sincerity and thoughtfulness these coaches show us, not just as a group but as individuals. I've made some of my forever friends on this platform and will always be thankful that I found this group.",
  },
  {
    id: 6,
    name: "Susie S",
    role: "",
    quote:
      "LIFEING has helped me begin to like myself again. It's helped me step out of my insecurities of self doubt and regret. I'm learning that it's okay to 'feel the feels' —that I AM loved, especially when I learn to love myself. Lifeing has given me the tools to dig deep and explore my thoughts and emotions in a way I haven't before.",
  },
  {
    id: 7,
    name: "Anonymous",
    role: "",
    quote:
      "While I respect what 12 step programs have done for some people, I never fully connected with the idea that total abstinence is the only path and I don't think that everyone who has had problem drinking is powerless to alcohol. I have power over the choices that I make and I've learned that my relationship with alcohol is complex. It's emotional, cultural, sometimes social… and I've found that the mindful moderation framework used by Lifeing gives me more agency and self-trust. For me, it's not about 'controlling' alcohol, but about being present, intentional, and honest with myself. This is 'Lifeing'",
  },
  {
    id: 8,
    name: "Christina O.",
    role: "",
    quote:
      "Lifeng has truly changed my life. With the support of their all-star team of compassionate coaches, I've been able to reduce my drinking, embrace genuine self-love and acceptance, and build healthy, lasting coping skills for all of life's ups and downs. The group sessions are welcoming, warm, and always uplifting. Every meeting feels like a safe haven where I can be myself, grow at my own pace, and know I'm not alone. I've learned so much about resilience, boundaries, and how to meet life with clarity and courage. This community has helped me heal in ways I never thought possible and I'm so grateful to be part of it. If you're ready for real transformation, this is the place to start. 💛",
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
                    {/* Name and Info */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-gilda text-[#18181B] mb-2">
                        {testimonial.name}
                      </h3>
                      {testimonial.role && (
                        <p className="text-lg text-[#3F3F46]">
                          {testimonial.role}
                        </p>
                      )}
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
