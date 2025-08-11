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
}

export function ForumSidebar({
  activePage,
  setActivePage,
  isFull = false,
  children,
}: ForumSidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col border-r border-gray-300 px-4 pt-1.5 gap-4 bg-lime-50",
        isFull
          ? "w-full h-full min-h-0"
          : "hidden lg:flex lg:flex-col lg:w-75 lg:flex-shrink-0"
      )}
    >
      <ForumTabs activePage={activePage} setActivePage={setActivePage} />
      {children}
    </div>
  );
}
