import React from "react";
import { cn } from "@/lib/utils";
import { useHasUnreadMessages } from "@/hooks/use-forum";

export interface IForumTabs {
  activePage: "Forum" | "Groups" | "Messages";
  setActivePage: React.Dispatch<
    React.SetStateAction<"Forum" | "Groups" | "Messages">
  >;
}

export function ForumTabs({ activePage, setActivePage }: IForumTabs) {
  const tabs = ["Forum", "Groups", "Messages"];
  const { data: hasUnreadMessages } = useHasUnreadMessages();

  return (
    <div className="flex flex-row items-center px-1 h-9 border-b border-gray-300">
      {tabs.map((tab) => {
        const isDisabled = tab === "Messagesss";
        const showNotification = tab === "Messages" && hasUnreadMessages;

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
              "relative flex flex-row justify-center items-center px-3 py-1 gap-2 h-9 text-sm font-medium transition-colors rounded-md",
              isDisabled
                ? "text-zinc-400 cursor-not-allowed opacity-50"
                : "cursor-pointer",
              activePage === tab && !isDisabled
                ? "border-b rounded-none"
                : !isDisabled && "text-zinc-500 hover:text-zinc-900"
            )}
            style={
              activePage === tab && !isDisabled
                ? {
                    borderBottomColor: "var(--forum-active-text)",
                    color: "var(--forum-active-text)",
                  }
                : {}
            }
          >
            {tab}
            {showNotification && (
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default ForumTabs;
