import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getAvatarProps } from "@/utils/forum-avatar-utils";

const userAvatarVariants = cva(
  "flex items-center justify-center text-white flex-shrink-0",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        default: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
        rounded: "rounded-lg",
      },
    },
    defaultVariants: {
      size: "default",
      shape: "circle",
    },
  }
);

export interface UserAvatarProps
  extends React.ComponentProps<typeof Avatar>,
    VariantProps<typeof userAvatarVariants> {
  username: string;
  size?: "sm" | "default" | "lg" | "xl";
  shape?: "circle" | "square" | "rounded";
}

/**
 * UserAvatar component for consistent avatar display across the forum
 * Always uses bg-primary color with user initials
 */
function UserAvatar({
  username,
  size = "default",
  shape = "circle",
  className,
  ...props
}: UserAvatarProps) {
  const { initials, color } = getAvatarProps(username);

  return (
    <Avatar
      data-slot="user-avatar"
      className={cn(userAvatarVariants({ size, shape }), color, className)}
      {...props}
    >
      <AvatarFallback className={cn("text-white", color)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export { UserAvatar, userAvatarVariants };
