"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "./logo";

const Banner = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationLinks = [
    { href: "#about", label: "About Lifeing" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#join", label: "Join Lifeing" },
    { href: "#community", label: "Community" },
  ];

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
      <header className="relative z-10 flex justify-between items-center px-16 py-13">
        {/* Logo */}
        <div className="flex items-center">
          <Logo className="text-white" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navigationLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white font-semibold text-base hover:text-gray-200 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-white font-semibold text-base hover:text-gray-200 transition-colors"
          >
            Member Login
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden relative z-20 bg-black/90 backdrop-blur-sm">
          <nav className="flex flex-col px-16 py-8 space-y-6">
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white font-semibold text-lg hover:text-gray-200 transition-colors"
                onClick={closeMobileMenu}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="text-white font-semibold text-lg hover:text-gray-200 transition-colors"
              onClick={closeMobileMenu}
            >
              Member Login
            </Link>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col justify-center items-start px-16 py-4 min-h-[calc(100vh-200px)]">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white leading-tight tracking-tight mb-5 font-serif">
            Your Space to Unfold
          </h1>

          <p className="text-lg md:text-xl text-white leading-relaxed mb-8 max-w-2xl">
            Your life doesn&apos;t need fixing, just some space. Lifeing is a
            calm digital sanctuary for you to grow at your own pace.
          </p>

          <Button
            className="bg-[#F3C703] text-[#42104C] font-bold text-base px-6 py-4 hover:bg-[#F3C703]/90 transition-colors"
            size="lg"
          >
            Find Your Space to Grow
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
