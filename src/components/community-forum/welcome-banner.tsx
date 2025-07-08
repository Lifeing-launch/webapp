"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const WELCOME_BANNER_KEY = "lifeing:forum-welcome-banner-dismissed";

/**
 * Welcome Banner Component
 */
export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isDismissed = localStorage.getItem(WELCOME_BANNER_KEY);
    if (isDismissed === "true") {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(WELCOME_BANNER_KEY, "true");
  };

  if (!isVisible) return null;

  return (
    <div className="mb-3 flex w-full items-center rounded-xl border border-border bg-white px-4 py-5 shadow-sm">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex-shrink-0">
          <Image
            src="/welcome-forum.svg"
            alt="Welcome to the lifeing community forum"
            width={45}
            height={45}
            className="h-11 w-11"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-semibold leading-none tracking-tight text-foreground">
            Welcome to the lifeing community forum
          </h2>
          <p className="text-sm leading-5 text-foreground">
            This is a safe space to connect with other Lifeing community members
            anonymously. Share thoughts, progress, and milestones.
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="h-auto w-auto flex-shrink-0 p-0 hover:bg-transparent hover:text-foreground cursor-pointer"
        aria-label="Dismiss welcome banner"
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}
