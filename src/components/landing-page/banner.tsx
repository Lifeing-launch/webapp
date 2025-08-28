"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./logo";
import { motion, AnimatePresence } from "framer-motion";

const Banner = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navigationLinks: { href: string; label: string }[] = [
    // { href: "#about", label: "About Lifeing" },
    // { href: "#how-it-works", label: "How it Works" },
    // { href: "#join", label: "Join Lifeing" },
    // { href: "#community", label: "Community" },
  ];

  // Animation variants
  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5,
      },
    },
  };

  const heroItemVariants = {
    hidden: {
      y: 50,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
      },
    },
  };

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 1.4,
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/landing/banner-background.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Header */}
      <motion.header
        className="relative z-10 flex justify-between items-center px-6 md:px-16 py-13"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Logo className="text-white" />
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navigationLinks.map((link, index) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="text-white font-semibold text-base hover:text-gray-200 transition-colors"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -2 }}
            >
              {link.label}
            </motion.a>
          ))}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link
              href="/login"
              className="text-white font-semibold text-base hover:text-gray-200 transition-colors"
            >
              Member Login
            </Link>
          </motion.div>
        </nav>

        {/* Mobile menu button */}
        <motion.button
          className="md:hidden text-white p-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      </motion.header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeMobileMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Sidebar */}
            <motion.div
              ref={sidebarRef}
              className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-sidebar/50 backdrop-blur-md"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Sidebar Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/20">
                <Logo className="text-white" />
                <motion.button
                  onClick={closeMobileMenu}
                  className="text-white p-2 hover:text-gray-300 transition-colors"
                  aria-label="Close mobile menu"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex flex-col p-6 space-y-6">
                {navigationLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    className="text-white font-semibold text-lg hover:text-gray-300 transition-colors py-2 border-white/10"
                    onClick={closeMobileMenu}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                    whileHover={{ x: 5 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <Link
                    href="/login"
                    className="text-white font-semibold text-lg hover:text-gray-300 transition-colors py-2 border-white/10"
                    onClick={closeMobileMenu}
                  >
                    Member Login
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div
        className="relative z-10 flex flex-col justify-start items-start px-6 md:px-16 py-4 min-h-[calc(100vh-200px)]"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-normal text-white leading-tight tracking-tight mb-5 font-gilda"
            variants={heroItemVariants}
          >
            Your Space to Grow
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white leading-relaxed mb-8 max-w-2xl"
            variants={heroItemVariants}
          >
            Change is hard and you don&apos;t need fixing, just a compassionate
            space to grow at your own pace. Lifeing is a community-based online
            sanctuary where real connection and lasting transformation is
            happening, every day.
          </motion.p>

          <motion.div variants={heroItemVariants}>
            <Link href="/signup">
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  className="bg-[#F3C703] text-[#42104C] font-bold text-base px-6 py-4 hover:bg-[#F3C703]/90 transition-colors"
                  size="lg"
                >
                  Find Your Space to Grow
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Banner;
