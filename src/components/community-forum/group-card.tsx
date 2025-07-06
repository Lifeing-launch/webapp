import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, LockKeyhole, Users, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GroupWithDetails } from "@/typing/forum";

const cardVariants = cva(
  "group transition-all duration-200 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/30 h-full",
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
  group: GroupWithDetails & {
    memberCount?: number;
  };
  onJoin?: () => void;
  onRequestJoin?: () => void;
  isJoinLoading?: boolean;
}

/**
 * Group Card Component - Displays group information in a card format
 */
export function GroupCard({
  group,
  onJoin,
  onRequestJoin,
  isJoinLoading = false,
  size,
  layout,
  className,
  onClick,
  ...props
}: IGroupCard) {
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent action if already loading
    if (isJoinLoading) return;

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
      <div className="flex-1 min-w-0 flex flex-col h-full">
        {/* Header Section */}
        <div className="space-y-1.5">
          {/* Group Name with Owner indicator */}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm leading-5 text-foreground truncate">
              {group.name}
            </h3>
            {group.is_owner && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 rounded-lg flex items-center gap-1 px-2 py-0.5 text-xs"
              >
                <Crown className="w-3 h-3" />
                Owner
              </Badge>
            )}
          </div>

          {/* Group Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{group.memberCount || group.members_count || 0} members</span>
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
        </div>

        {/* Group Description - grows to fill available space */}
        <div className="flex-1 py-2">
          <p className="text-sm text-foreground line-clamp-3 leading-5">
            {group.description}
          </p>
        </div>

        {/* Group Status/Actions - stays at bottom */}
        <div className="pt-2 mt-auto">
          {group.isJoined || group.is_owner ? (
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
              disabled={isJoinLoading}
              className="text-xs h-8 cursor-pointer disabled:cursor-not-allowed"
            >
              {isJoinLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  {group.group_type === "private"
                    ? "Requesting..."
                    : "Joining..."}
                </>
              ) : (
                <>
                  {group.group_type === "private" ? "Request to Join" : "Join"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupCard;
