"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Category } from "@/typing/forum";
import { Skeleton } from "@/components/ui/skeleton";
import { useSectionColors } from "@/hooks/use-section-colors";

export interface ICategoryList {
  categories: Category[];
  activeCategory?: string;
  onCategoryClick: (category: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function CategoryList({
  categories,
  activeCategory,
  onCategoryClick,
  isLoading,
  emptyMessage = "No categories available",
}: ICategoryList) {
  const { colors } = useSectionColors();

  if (isLoading) {
    return (
      <div className="space-y-2 w-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full rounded-md block" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-xs text-muted-foreground py-2">{emptyMessage}</div>
    );
  }

  return (
    <>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryClick(category.id)}
          className={cn(
            "block w-full text-left text-sm leading-5 transition-colors cursor-pointer",
            activeCategory === category.id
              ? "font-semibold"
              : "font-normal text-zinc-900"
          )}
          style={{
            color: activeCategory === category.id ? colors.primary : "#18181b", // zinc-900
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              activeCategory === category.id ? colors.primary : "#18181b";
          }}
        >
          {category.name}
        </button>
      ))}
    </>
  );
}

export default CategoryList;
