import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

const messageInputVariants = cva("flex gap-2 items-end", {
  variants: {
    layout: {
      horizontal: "flex-row",
      vertical: "flex-col items-stretch gap-3",
    },
    size: {
      sm: "",
      default: "",
      lg: "",
    },
  },
  defaultVariants: {
    layout: "horizontal",
    size: "default",
  },
});

const textareaVariants = cva(
  "resize-none border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
  {
    variants: {
      size: {
        sm: "min-h-[60px] p-2 text-sm",
        default: "min-h-[80px] p-3 text-sm",
        lg: "min-h-[100px] p-4 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface MessageInputProps
  extends Omit<React.ComponentProps<"form">, "onSubmit">,
    VariantProps<typeof messageInputVariants> {
  /**
   * Placeholder text for the textarea
   */
  placeholder?: string;
  /**
   * Current value of the input
   */
  value: string;
  /**
   * Called when value changes
   */
  onChange: (value: string) => void;
  /**
   * Called when form is submitted
   */
  onSubmit: (value: string) => void;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Whether to show send button
   */
  showSendButton?: boolean;
  /**
   * Custom send button text
   */
  sendButtonText?: string;
  /**
   * Send button variant
   */
  sendButtonVariant?: "default" | "outline" | "secondary";
  /**
   * Max length for the input
   */
  maxLength?: number;
  /**
   * Show character counter
   */
  showCounter?: boolean;
  /**
   * Additional textarea props
   */
  textareaProps?: React.ComponentProps<"textarea">;
}

/**
 * MessageInput Component
 *
 * A reusable message input component with submit handling, character counting,
 * and consistent styling. Eliminates repeated form patterns across forum components.
 *
 * @example
 * ```tsx
 * <MessageInput
 *   placeholder="Write your message..."
 *   value={message}
 *   onChange={setMessage}
 *   onSubmit={handleSendMessage}
 *   maxLength={500}
 *   showCounter
 * />
 * ```
 */
const MessageInput = React.forwardRef<HTMLFormElement, MessageInputProps>(
  (
    {
      placeholder = "Type your message...",
      value,
      onChange,
      onSubmit,
      disabled = false,
      showSendButton = true,
      sendButtonText = "Send",
      sendButtonVariant = "default",
      maxLength,
      showCounter = false,
      layout,
      size,
      className,
      textareaProps,
      ...props
    },
    ref
  ) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit(value.trim());
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
      // Call any existing onKeyDown from textareaProps
      textareaProps?.onKeyDown?.(e);
    };

    const isOverLimit = maxLength ? value.length > maxLength : false;
    const canSubmit = value.trim() && !disabled && !isOverLimit;

    return (
      <form
        ref={ref}
        data-slot="message-input"
        onSubmit={handleSubmit}
        className={cn(messageInputVariants({ layout, size }), className)}
        {...props}
      >
        <div className="flex-1 space-y-1">
          <textarea
            {...textareaProps}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              textareaVariants({ size }),
              "w-full",
              isOverLimit &&
                "border-destructive focus:ring-destructive/20 focus:border-destructive",
              textareaProps?.className
            )}
            rows={3}
          />

          {showCounter && maxLength && (
            <div className="flex justify-end">
              <span
                className={cn(
                  "text-xs",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {value.length}/{maxLength}
              </span>
            </div>
          )}
        </div>

        {showSendButton && (
          <Button
            type="submit"
            disabled={!canSubmit}
            variant={sendButtonVariant}
            size={size === "sm" ? "sm" : "default"}
            className={cn(layout === "vertical" && "self-end")}
          >
            <Send className="h-4 w-4 mr-2" />
            {sendButtonText}
          </Button>
        )}
      </form>
    );
  }
);

MessageInput.displayName = "MessageInput";

export { MessageInput, messageInputVariants, textareaVariants };
