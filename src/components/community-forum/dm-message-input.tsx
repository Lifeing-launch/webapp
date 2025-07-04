import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface DMMessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

/**
 * Direct Message Input Component
 * Input field for sending direct messages
 */
export function DMMessageInput({
  onSendMessage,
  disabled = false,
}: DMMessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-0">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message @healing_jane"
            disabled={disabled}
            className="w-full min-h-[80px] p-3 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            rows={3}
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm"
          size="default"
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </form>
  );
}
