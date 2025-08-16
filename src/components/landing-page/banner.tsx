"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./logo";

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
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />

        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-sidebar/50 backdrop-blur-md transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/20">
            <Logo className="text-white" />
            <button
              onClick={closeMobileMenu}
              className="text-white p-2 hover:text-gray-300 transition-colors"
              aria-label="Close mobile menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex flex-col p-6 space-y-6">
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white font-semibold text-lg hover:text-gray-300 transition-colors py-2  border-white/10"
                onClick={closeMobileMenu}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="text-white font-semibold text-lg hover:text-gray-300 transition-colors py-2  border-white/10"
              onClick={closeMobileMenu}
            >
              Member Login
            </Link>
          </nav>
        </div>
      </div>

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

          <Link href="/signup">
            <Button
              className="bg-[#F3C703] text-[#42104C] font-bold text-base px-6 py-4 hover:bg-[#F3C703]/90 transition-colors"
              size="lg"
            >
              Find Your Space to Grow
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Banner;
