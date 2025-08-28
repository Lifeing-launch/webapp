"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Tag } from "@/typing/forum";
import { Skeleton } from "@/components/ui/skeleton";
import { useSectionColors } from "@/hooks/use-section-colors";

export interface ITagList {
  tags: Tag[];
  activeTag?: string;
  onTagClick: (tag: string) => void;
  isLoading?: boolean;
}

export function TagList({ tags, activeTag, onTagClick, isLoading }: ITagList) {
  const { colors } = useSectionColors();

  if (isLoading) {
    return (
      <div className="space-y-2 w-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full rounded-md block" />
        ))}
      </div>
    );
  }
  return (
    <>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onTagClick(tag.id)}
          className={cn(
            "block w-full text-left text-sm leading-5 transition-colors cursor-pointer",
            activeTag === tag.id ? "font-semibold" : "font-normal text-zinc-900"
          )}
          style={{
            color: activeTag === tag.id ? colors.primary : "#18181b", // zinc-900
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              activeTag === tag.id ? colors.primary : "#18181b";
          }}
        >
          #{tag.name}
        </button>
      ))}
    </>
  );
}

export default TagList;
