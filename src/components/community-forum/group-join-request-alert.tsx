import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex items-center gap-1 px-4 py-2.5 h-10 rounded-lg transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-purple-100 border border-purple-200 text-zinc-900",
        info: "bg-blue-100 border border-blue-200 text-blue-900",
        warning: "bg-yellow-100 border border-yellow-200 text-yellow-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface GroupJoinRequestAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  requestCount: number;
  onViewRequests: () => void;
}

/**
 * Alert component for group join requests
 */
export function GroupJoinRequestAlert({
  requestCount,
  onViewRequests,
  variant,
  className,
  ...props
}: GroupJoinRequestAlertProps) {
  return (
    <div
      data-slot="group-join-request-alert"
      className={cn(alertVariants({ variant, className }))}
      style={{ backgroundColor: "#DAC9DE" }}
      {...props}
    >
      <Bell className="w-4 h-4" strokeWidth={1.33} />
      <div className="flex items-center gap-2 flex-1">
        <p className="text-sm leading-5 font-normal">
          You have {requestCount} outstanding join request
          {requestCount > 1 ? "s" : ""} waiting for your approval.
        </p>
        <button
          onClick={onViewRequests}
          className="text-sm leading-5 font-normal underline hover:opacity-80 transition-opacity text-primary hover:text-primary/80 cursor-pointer"
        >
          View requests
        </button>
      </div>
    </div>
  );
}
