import React from "react";
import { cn } from "@/lib/utils";
import { ForumTabs } from "./sidebar/forum-tabs";

interface ForumSidebarProps {
  activePage: "Forum" | "Groups" | "Messages";
  setActivePage: React.Dispatch<
    React.SetStateAction<"Forum" | "Groups" | "Messages">
  >;
  isFull?: boolean;
  children?: React.ReactNode;
  onItemClick?: () => void;
}

export function ForumSidebar({
  activePage,
  setActivePage,
  isFull = false,
  children,
  onItemClick,
}: ForumSidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col border-r border-gray-300 px-4 pt-1.5 gap-4 overflow-y-auto",
        isFull
          ? "w-full h-full min-h-0 z-0"
          : "hidden lg:flex lg:flex-col lg:w-75 lg:flex-shrink-0 z-0"
      )}
      style={{
        backgroundColor: "var(--forum-background)",
      }}
    >
      <ForumTabs
        activePage={activePage}
        setActivePage={setActivePage}
        onItemClick={onItemClick}
      />
      {children}
    </div>
  );
}
