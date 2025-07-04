import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DMContact } from "@/typing/forum";
import { User } from "lucide-react";

export interface IDMContactsList {
  contacts: DMContact[];
  selectedContactId?: number;
  onContactSelect: (contactId: number) => void;
}

/**
 * Direct Messages Contacts List Component
 * Shows list of contacts for direct messaging
 */
export function DMContactsList({
  contacts,
  selectedContactId,
  onContactSelect,
}: IDMContactsList) {
  return (
    <div className="flex flex-col gap-4 py-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          onClick={() => onContactSelect(contact.id)}
          className={cn(
            "flex items-center gap-1.5 p-0 cursor-pointer hover:opacity-80 transition-opacity",
            contact.isActive && "opacity-100",
            selectedContactId === contact.id && "font-semibold"
          )}
        >
          <div className="h-5 w-5 flex-shrink-0 bg-primary rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>

          {/* Contact Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-sm truncate",
                  selectedContactId === contact.id
                    ? "text-primary font-semibold"
                    : "text-zinc-900"
                )}
              >
                {contact.username}
              </span>
              {/* {contact.unreadCount && contact.unreadCount > 0 ? (
                <span className="bg-primary text-white text-xs rounded-full px-1.5 py-0.5  text-center leading-none">
                  {contact.unreadCount}
                </span>
              ) : null} */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DMContactsList;
