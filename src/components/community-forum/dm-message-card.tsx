import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MessageWithDetails } from "@/typing/forum";
import { formatTimeAgo } from "@/utils/datetime";
import { getAvatarBackgroundStyle } from "@/utils/forum-avatar-colors";

interface DMMessageCardProps {
  message: MessageWithDetails;
}

/**
 * Direct Message Card Component
 * Displays individual direct messages without likes or comments
 */
export function DMMessageCard({ message }: DMMessageCardProps) {
  const displayName = message.sender_profile?.nickname || "Unknown User";

  return (
    <div
      className={cn(
        "flex gap-4 py-6 px-0 first:pt-0 last:pb-2",
        "border-b border-gray-100 last:border-b-0"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback
          className={cn("text-white")}
          style={getAvatarBackgroundStyle(message.sender_anon_id)}
        >
          {displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className="min-w-0 flex-1">
        {/* Header with username and timestamp */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <h4 className="text-sm font-semibold text-zinc-900">{displayName}</h4>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(message.created_at)}
          </span>
        </div>

        {/* Message Text */}
        <p className="text-sm leading-5 text-zinc-900">{message.content}</p>
      </div>
    </div>
  );
}
