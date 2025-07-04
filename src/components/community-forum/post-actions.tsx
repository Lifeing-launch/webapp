import React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IPostActions {
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: () => void;
  onCommentClick: () => void;
  isCommentsExpanded: boolean;
}

export function PostActions({
  isLiked,
  likesCount,
  commentsCount,
  onLike,
  onCommentClick,
  isCommentsExpanded,
}: IPostActions) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <button
        onClick={onLike}
        className={cn(
          "flex items-center gap-1 transition-colors hover:text-primary cursor-pointer",
          isLiked && "text-primary"
        )}
      >
        <Heart className={cn("h-4.5 w-4.5", isLiked && "fill-current")} />
        <span>{likesCount}</span>
      </button>
      <span className="text-zinc-400">•</span>
      <button
        onClick={onCommentClick}
        className={cn(
          "transition-colors hover:text-foreground cursor-pointer",
          isCommentsExpanded && "text-black font-normal"
        )}
      >
        {commentsCount} Comments
      </button>
    </div>
  );
}

export default PostActions;
