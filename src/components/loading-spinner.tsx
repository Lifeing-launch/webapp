import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingSpinnerProps extends React.ComponentPropsWithoutRef<"div"> {
  isProtectedPage?: boolean;
}

export const LoadingSpinner = ({
  className,
  isProtectedPage = false,
  ...props
}: LoadingSpinnerProps) => {
  return (
    <div
      className={cn(
        "h-full w-full flex-1 flex justify-center items-center text-primary",
        isProtectedPage && "min-h-[calc(100vh-4rem)]",
        className
      )}
      {...props}
    >
      <Loader2 className="animate-spin" />
    </div>
  );
};
