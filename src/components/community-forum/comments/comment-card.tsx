import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CommentWithDetails, StatusEnum } from "@/typing/forum";
import { formatTimeAgo } from "@/utils/datetime";
import { Clock, AlertCircle, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAvatarBackgroundStyle } from "@/utils/forum-avatar-colors";

interface CommentCardProps {
  comment: CommentWithDetails;
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

export function CommentCard({ comment }: CommentCardProps) {
  const status = comment.status ?? "approved";

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "flex gap-4 p-3 border-b border-gray-100 last:border-b-0 transition-all",
          getStatusStyles(status)
        )}
      >
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback
            className={cn("text-white")}
            style={getAvatarBackgroundStyle(comment.author_anon_id)}
          >
            <User className="h-6 w-6" />
            {/* {comment.author_profile?.nickname.slice(0, 2).toUpperCase() || "U"} */}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1.5">
            <h5 className="text-sm font-semibold text-zinc-900">
              {comment.author_profile?.nickname || "Usuário"}
            </h5>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.created_at)}
            </span>
            {status !== "approved" && (
              <Tooltip>
                <TooltipTrigger>
                  {status === "pending" && (
                    <Clock className="h-3 w-3 text-muted-foreground" />
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
          </div>
          <p
            className={cn("text-sm leading-5 text-zinc-900", {
              "line-through": status === "rejected",
            })}
          >
            {comment.content}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
