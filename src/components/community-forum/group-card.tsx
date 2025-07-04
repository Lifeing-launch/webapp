import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, LockKeyhole, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ForumGroup } from "@/typing/forum";

const cardVariants = cva(
  "group transition-all duration-200 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/30",
  {
    variants: {
      size: {
        default: "p-4",
        sm: "p-3",
        lg: "p-6",
      },
      layout: {
        default: "flex items-start gap-4",
        vertical: "flex flex-col space-y-3",
      },
      state: {
        default: "",
        joined: "cursor-pointer",
        pending: "",
      },
    },
    defaultVariants: {
      size: "default",
      layout: "default",
      state: "default",
    },
  }
);

const avatarVariants = cva(
  "flex items-center justify-center text-white flex-shrink-0 rounded-full bg-primary",
  {
    variants: {
      size: {
        default: "w-10 h-10",
        sm: "w-8 h-8",
        lg: "w-12 h-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface IGroupCard
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  group: ForumGroup;
  onJoin?: () => void;
  onRequestJoin?: () => void;
}

/**
 * Group Card Component - Displays group information in a card format
 */
export function GroupCard({
  group,
  onJoin,
  onRequestJoin,
  size,
  layout,
  className,
  onClick,
  ...props
}: IGroupCard) {
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (group.group_type === "private") {
      onRequestJoin?.();
    } else {
      onJoin?.();
    }
  };

  const cardState = group.isJoined ? "joined" : "default";

  // Only make card clickable if user is joined to the group
  const cardClickHandler = group.isJoined ? onClick : undefined;

  return (
    <div
      data-slot="group-card"
      className={cn(
        cardVariants({ size, layout, state: cardState, className })
      )}
      onClick={cardClickHandler}
      {...props}
    >
      {/* Group Avatar */}
      <div className={cn(avatarVariants({ size }))}>
        <Users className="w-6 h-6" strokeWidth={2} />
      </div>

      {/* Group Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Group Name */}
        <h3 className="font-semibold text-sm leading-5 text-foreground truncate">
          {group.name}
        </h3>

        {/* Group Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{group.memberCount || 0} members</span>
          <span>•</span>
          {group.group_type === "private" ? (
            <div className="flex items-center gap-1">
              <LockKeyhole className="w-3 h-3" />
              <span>Private Group</span>
            </div>
          ) : (
            <span>Public Group</span>
          )}
        </div>

        {/* Group Description */}
        <p className="text-sm text-foreground line-clamp-2 leading-5">
          {group.description}
        </p>

        {/* Group Status/Actions */}
        <div className="pt-2">
          {group.isJoined ? (
            <Badge
              variant="secondary"
              className="bg-lime-100 text-lime-800 rounded-lg"
            >
              <Check className="w-3 h-3" />
              Joined
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={handleJoinClick}
              className="text-xs h-8 cursor-pointer"
            >
              {group.group_type === "private" ? "Request to Join" : "Join"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupCard;
