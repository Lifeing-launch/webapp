import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

export const LoadingSpinner = ({
  className,
}: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div
      className={cn(
        "h-full w-full flex-1 flex justify-center items-center text-primary",
        className
      )}
    >
      <Loader2 className="animate-spin" />
    </div>
  );
};
