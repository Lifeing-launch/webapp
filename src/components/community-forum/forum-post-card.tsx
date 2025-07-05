import React, { useState, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PostWithDetails, StatusEnum } from "@/typing/forum";
import { PostActions } from "./post-actions";
import { CommentSection } from "./comments/comment-section";
import { formatTimeAgo } from "@/utils/datetime";
import { User, Clock, AlertCircle } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface IForumPostCard {
  post: PostWithDetails;
  onLike?: (postId: string) => void;
  onAddComment?: (postId: string, comment: string) => void;
}

const getStatusStyles = (status: StatusEnum) => {
  switch (status) {
    case "pending":
      return "opacity-75";
    case "rejected":
      return "opacity-50 bg-red-50/50";
    default:
      return "";
  }
};

export function ForumPostCard({ post, onLike }: IForumPostCard) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

  const status = post.status ?? "approved";

  const handleLike = useCallback(() => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev: number) => (newIsLiked ? prev + 1 : prev - 1));
    onLike?.(post.id);
  }, [isLiked, post.id, onLike]);

  const handleCommentsToggle = useCallback(() => {
    setIsCommentsExpanded(!isCommentsExpanded);
  }, [isCommentsExpanded]);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "border-b border-gray-200 py-6 px-2 first:pt-4 transition-all",
          getStatusStyles(status)
        )}
      >
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className={cn("text-white bg-primary")}>
              <User className="h-6 w-6" />
              {/* {post.author_profile.nickname.slice(0, 2).toUpperCase()} */}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="mb-1.5">
              <h4 className="text-sm font-semibold text-zinc-900">
                {post.author_profile.nickname}
              </h4>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(post.created_at)}
                </span>
                {status !== "approved" && (
                  <Tooltip>
                    <TooltipTrigger>
                      {status === "pending" && (
                        <Clock className="h-3 w-3 text-gray-500" />
                      )}
                      {status === "rejected" && (
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {status === "pending" && <p>Under Moderation</p>}
                      {status === "rejected" && <p>Rejected by Moderation</p>}
                    </TooltipContent>
                  </Tooltip>
                )}
                <Badge
                  variant="secondary"
                  className="bg-primary/40 text-primary text-xs py-0.5 px-2 rounded-lg"
                >
                  {post.category?.name}
                </Badge>
                {post.tags?.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="ghost"
                    className="text-primary text-xs"
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            <p
              className={cn("text-sm leading-5 text-zinc-900 mb-1.5", {
                "line-through": status === "rejected",
              })}
            >
              {post.content}
            </p>

            <PostActions
              isLiked={isLiked}
              likesCount={likesCount}
              commentsCount={post.comments_count || 0}
              onLike={handleLike}
              onCommentClick={handleCommentsToggle}
              isCommentsExpanded={isCommentsExpanded}
              isLikeDisabled={status !== "approved"}
            />
          </div>
        </div>

        <Collapsible.Root open={isCommentsExpanded}>
          <Collapsible.Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
            <CommentSection postId={post.id} opened={isCommentsExpanded} />
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </TooltipProvider>
  );
}

export default ForumPostCard;
