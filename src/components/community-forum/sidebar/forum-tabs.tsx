import React from "react";
import { cn } from "@/lib/utils";

export interface IForumTabs {
  activePage: "Forum" | "Groups" | "Messages";
  setActivePage: React.Dispatch<
    React.SetStateAction<"Forum" | "Groups" | "Messages">
  >;
}

export function ForumTabs({ activePage, setActivePage }: IForumTabs) {
  const tabs = ["Forum", "Groups", "Messages"];

  return (
    <div className="flex flex-row items-center px-1 h-9 border-b border-gray-300">
      {tabs.map((tab) => {
        const isDisabled = tab === "Messagesss";

        return (
          <button
            key={tab}
            onClick={() => {
              if (!isDisabled) {
                setActivePage(tab as "Forum" | "Groups" | "Messages");
              }
            }}
            disabled={isDisabled}
            className={cn(
              "flex flex-row justify-center items-center px-3 py-1 gap-2 h-9 text-sm font-medium transition-colors rounded-md",
              isDisabled
                ? "text-zinc-400 cursor-not-allowed opacity-50"
                : "cursor-pointer",
              activePage === tab && !isDisabled
                ? "border-b border-primary text-zinc-900 rounded-none"
                : !isDisabled && "text-zinc-500 hover:text-zinc-900"
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

export default ForumTabs;
