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

  const handleClick = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("rsvps").insert({
        resource_id: String(resourceId),
        user_id: user.id,
      });

      if (error) {
        throw new Error(error?.message);
      }

      setIsBookmarked(true);
    } catch (err) {
      toast.error("Failed to bookmark this resource");
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickMock = async (e: React.MouseEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const shouldReject = !!Math.round(Math.random());
    const dummyError = { error: { message: "Fake error" } };
    const errorMessage = isBookmarked
      ? "Failed to remove this bookmark"
      : "Failed to bookmark";
    const successMessage = isBookmarked ? "Bookmark removed" : "Bookmark added";

    try {
      const { error } = await new Promise<{ error?: { message?: string } }>(
        (resolve, reject) =>
          setTimeout(
            shouldReject ? () => resolve({}) : () => reject(dummyError),
            3000
          )
      );

      if (error) {
        throw new Error(error?.message);
      }

      setIsBookmarked(!isBookmarked);
      toast.success(successMessage);
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
      onClick={handleClickMock}
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
              ? "text-lime-500 fill-lime-500 hover:text-muted-foreground hover:fill-none"
              : "text-muted-foreground hover:text-lime-500 hover:fill-lime-500"
          )}
        />
      )}
    </Button>
  );
}
