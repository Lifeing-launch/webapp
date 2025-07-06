import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center",
  {
    variants: {
      size: {
        sm: "py-8 px-4",
        default: "py-12 px-6",
        lg: "py-16 px-8",
      },
      variant: {
        default: "",
        subtle: "text-muted-foreground",
        bordered: "border border-dashed border-border rounded-lg",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  /**
   * Icon component to display
   */
  icon?: React.ReactNode;
  /**
   * Title of the empty state
   */
  title: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Optional action button
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
}

/**
 * EmptyState Component
 *
 * A reusable empty state component for when lists or content areas are empty.
 * Provides consistent styling and structure across the application.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<MessageCircle className="h-12 w-12" />}
 *   title="No messages yet"
 *   description="Start a conversation with other community members"
 *   action={{
 *     label: "Send a message",
 *     onClick: () => openNewMessage()
 *   }}
 * />
 * ```
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { icon, title, description, action, size, variant, className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="empty-state"
        className={cn(emptyStateVariants({ size, variant }), className)}
        {...props}
      >
        {icon && <div className="mb-4 text-muted-foreground/50">{icon}</div>}

        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

        {description && (
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            {description}
          </p>
        )}

        {action && (
          <Button
            variant={action.variant || "default"}
            onClick={action.onClick}
            size="sm"
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export { EmptyState, emptyStateVariants };
