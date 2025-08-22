"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/browser";
import React from "react";

interface SignoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const SignoutButton: React.FC<SignoutButtonProps> = ({
  variant = "ghost",
  size = "icon",
  className = "",
}) => {
  const handleSignout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignout}
    >
      <X className="h-8 w-8" />
      <span className="sr-only">Log out</span>
    </Button>
  );
};
