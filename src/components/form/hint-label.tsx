import React from "react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HintLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
  showHint?: boolean;
}

export function HintLabel({
  htmlFor,
  children,
  hint,
  className,
  showHint = true,
}: HintLabelProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Label htmlFor={htmlFor} className="cursor-help">
        {children}
      </Label>
      {showHint && hint && (
        <Tooltip>
          <TooltipTrigger asChild>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className=" lucide lucide-circle-question-mark-icon lucide-circle-question-mark h-4 w-4 text-muted-foreground cursor-help"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hint}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
