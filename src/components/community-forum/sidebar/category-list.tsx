import React from "react";
import { cn } from "@/lib/utils";
import { Category } from "@/typing/forum";
import { Skeleton } from "@/components/ui/skeleton";

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
            "block w-full text-left text-sm font-normal leading-5 text-zinc-900 transition-colors hover:text-primary cursor-pointer",
            activeCategory === category.id && "font-semibold text-primary"
          )}
        >
          {category.name}
        </button>
      ))}
    </>
  );
}

export default CategoryList;
