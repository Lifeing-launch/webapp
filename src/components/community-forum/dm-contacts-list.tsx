import React from "react";
import { cn } from "@/lib/utils";
import { DMContact } from "@/typing/forum";

interface DMContactsListProps {
  contacts: DMContact[];
  selectedContactId?: string;
  onContactSelect: (contactId: string) => void;
}

/**
 * Direct Messages Contacts List Component
 * Displays a list of users that have exchanged messages with the current user
 */
export function DMContactsList({
  contacts,
  selectedContactId,
  onContactSelect,
}: DMContactsListProps) {
  return (
    <div className="h-full overflow-y-auto">
      {contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <p className="text-muted-foreground text-sm">
            No conversations yet. Start a new conversation!
          </p>
        </div>
      ) : (
        <div className="py-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onContactSelect(contact.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors",
                selectedContactId === contact.id && "bg-accent"
              )}
            >
              {/* Avatar */}
              <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-medium">
                {contact.username.slice(1, 3).toUpperCase()}
              </div>

              {/* Contact Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    {contact.username}
                  </h4>
                  {/* {contact.isActive && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )} */}
                </div>

                {/* {contact.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.lastMessage}
                  </p>
                )} */}

                {/* {contact.lastMessageTime && (
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(contact.lastMessageTime)}
                  </span>
                )} */}
              </div>

              {/* Unread Count */}
              {/* {contact.unreadCount && contact.unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {contact.unreadCount}
                </Badge>
              )} */}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DMContactsList;
