"use client";

import React, { useState, useEffect } from "react";
import { Search, Pen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useSectionColors } from "@/hooks/use-section-colors";

export interface IForumHeader {
  title?: string;
  buttonText?: string;
  searchQuery: string;
  placeholder?: string;
  hiddenButton?: boolean;
  buttonIcon?: React.ReactNode;
  buttonOnClick?: () => void;
  setSearchQuery?: (query: string) => void;
  searchDropdown?: React.ReactNode;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function ForumHeader({
  title = "Lifeing Lounge",
  buttonText = "Share a thought",
  placeholder = "Search forum",
  hiddenButton = false,
  searchQuery,
  setSearchQuery,
  buttonIcon = <Pen className="w-4 h-4" />,
  buttonOnClick,
  searchDropdown,
  onMenuClick,
  showMenuButton = false,
}: IForumHeader) {
  const { colors } = useSectionColors();
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedValue = useDebounce(inputValue, 500); // 500ms delay

  useEffect(() => {
    setSearchQuery?.(debouncedValue);
  }, [debouncedValue, setSearchQuery]);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-2 sm:flex-1">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="Open filters"
          >
            <Filter className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-bold leading-8 text-foreground sm:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative w-full sm:w-72">
          <div className="relative flex items-center gap-1 h-9 px-3 py-1 bg-white border border-border rounded-md shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="border-0 bg-transparent p-0 text-sm leading-5 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {searchDropdown}
        </div>

        {!hiddenButton && (
          <Button
            onClick={buttonOnClick}
            className="flex items-center justify-center gap-2 h-9 px-4 py-2 text-white rounded-md shadow-sm w-full sm:w-auto cursor-pointer"
            style={{
              backgroundColor: colors.primary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
              e.currentTarget.style.opacity = "1";
            }}
          >
            {buttonIcon}
            <span className="text-sm font-medium leading-5">{buttonText}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default ForumHeader;
