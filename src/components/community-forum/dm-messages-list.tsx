import React from "react";
import { MessageWithDetails } from "@/typing/forum";
import { DMMessageCard } from "./dm-message-card";

interface DMMessagesListProps {
  messages: MessageWithDetails[];
}

/**
 * Direct Messages List Component
 * Similar to ForumPostList but focused on direct messages
 */
export function DMMessagesList({ messages }: DMMessagesListProps) {
  return (
    <div className="h-full overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground text-sm">
            No messages yet. Start a conversation!
          </p>
        </div>
      ) : (
        <div className="py-3">
          {messages.map((message) => (
            <DMMessageCard key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
