import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-current",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        default: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-[3px]",
        xl: "h-12 w-12 border-4",
      },
      variant: {
        default: "border-muted-foreground/30 border-t-primary",
        secondary: "border-secondary/30 border-t-secondary-foreground",
        accent: "border-accent/30 border-t-accent-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Optional text to display alongside the spinner
   */
  text?: string;
  /**
   * Position of text relative to spinner
   */
  textPosition?: "right" | "below";
}

/**
 * LoadingSpinner Component
 *
 * A reusable loading spinner with text support and multiple size variants.
 * Eliminates the need for custom loading implementations throughout the app.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" text="Loading posts..." />
 * <LoadingSpinner variant="secondary" textPosition="below" text="Please wait" />
 * ```
 */
const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    { size, variant, text, textPosition = "right", className, ...props },
    ref
  ) => {
    if (!text) {
      return (
        <div
          ref={ref}
          data-slot="loading-spinner"
          className={cn(spinnerVariants({ size, variant }), className)}
          {...props}
        />
      );
    }

    const containerClasses = cn(
      "flex items-center gap-2",
      textPosition === "below" && "flex-col gap-1"
    );

    return (
      <div
        ref={ref}
        data-slot="loading-spinner-container"
        className={cn(containerClasses, className)}
        {...props}
      >
        <div className={cn(spinnerVariants({ size, variant }))} />
        <span className="text-sm text-muted-foreground">{text}</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner, spinnerVariants };
