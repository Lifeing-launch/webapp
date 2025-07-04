import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ForumComment } from "@/typing/forum";
import { formatTimeAgo } from "@/utils/datetime";

interface CommentCardProps {
  comment: ForumComment;
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <div className="flex gap-4 p-3 border-b border-gray-100 last:border-b-0">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback className={cn("text-white", "bg-primary")}>
          {comment.author?.nickname.slice(1, 3).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 mb-1.5">
          <h5 className="text-sm font-semibold text-zinc-900">
            {comment.author?.nickname}
          </h5>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(comment.created_at)}
          </span>
        </div>
        <p className="text-sm leading-5 text-zinc-900">{comment.content}</p>
      </div>
    </div>
  );
}
