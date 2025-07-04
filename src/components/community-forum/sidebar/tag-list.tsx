import React from "react";
import { cn } from "@/lib/utils";
import { Tag } from "@/typing/forum";
import { Skeleton } from "@/components/ui/skeleton";

export interface ITagList {
  tags: Tag[];
  activeTag?: string;
  onTagClick: (tag: string) => void;
  isLoading?: boolean;
}

export function TagList({ tags, activeTag, onTagClick, isLoading }: ITagList) {
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
            "block w-full text-left text-sm leading-5 transition-colors hover:text-primary cursor-pointer",
            activeTag === tag.id
              ? "font-semibold text-primary"
              : "font-normal text-zinc-900"
          )}
        >
          #{tag.name}
        </button>
      ))}
    </>
  );
}

export default TagList;
