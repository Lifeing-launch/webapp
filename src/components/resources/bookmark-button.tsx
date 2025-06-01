"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/browser";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  resourceId: number;
  hasBookmarked?: boolean;
}

export default function BookmarkButton({
  resourceId,
  hasBookmarked,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(hasBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    setIsLoading(true);
    const supabase = createClient();
    const errorMessage = isBookmarked
      ? "Failed to remove this bookmark"
      : "Failed to bookmark";

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      if (isBookmarked) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("resource_id", resourceId)
          .eq("user_id", user.id);

        if (error) {
          throw new Error(error?.message);
        }

        setIsBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        const { error } = await supabase.from("bookmarks").insert({
          resource_id: String(resourceId),
          user_id: user.id,
        });

        if (error) {
          throw new Error(error?.message);
        }

        setIsBookmarked(true);
        toast.success("Bookmark added");
      }
    } catch (err) {
      toast.error(errorMessage);
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      className="p-0 hover:bg-transparent cursor-pointer"
      onClick={handleClick}
      asChild
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="animate-spin size-6 text-muted-foreground" />
      ) : (
        <Bookmark
          className={cn(
            "size-6",
            isBookmarked
              ? "text-lime-500 fill-lime-500 hover:text-lime-500"
              : "text-muted-foreground hover:text-muted-foreground"
          )}
        />
      )}
    </Button>
  );
}
