import React from "react";
import { cn } from "@/lib/utils";
import { DMContact } from "@/typing/forum";
import { formatTimeAgo } from "@/utils/datetime";
import { MessageCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { useUnreadCount } from "@/hooks/use-forum";

interface DMContactsListProps {
  contacts: DMContact[];
  selectedContactId?: string;
  onContactSelect: (contactId: string) => void;
}

/**
 * Component to show unread count for a contact
 */
function ContactUnreadCount({ contactId }: { contactId: string }) {
  const { data: unreadCount } = useUnreadCount(contactId);

  if (!unreadCount || unreadCount === 0) {
    return null;
  }

  return (
    <Badge
      variant="destructive"
      className="ml-2 h-5 w-5 flex items-center justify-center text-xs rounded-full p-0"
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </Badge>
  );
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
          <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-sm font-medium text-foreground mb-1">
            No conversations yet
          </h3>
          <p className="text-xs text-muted-foreground">
            Click &ldquo;New Conversation&rdquo; to start messaging
          </p>
        </div>
      ) : (
        <div className="py-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onContactSelect(contact.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-colors",
                selectedContactId === contact.id && "bg-accent"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "h-6 w-6 rounded-full text-white flex items-center justify-center text-xs font-medium flex-shrink-0",
                  contact.avatarColor || "bg-primary"
                )}
              >
                {contact.username.slice(0, 2).toUpperCase()}
              </div>

              {/* Contact Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    @{contact.username}
                  </h4>
                  {contact.lastMessageTime && (
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(contact.lastMessageTime)}
                    </span>
                  )}
                </div>

                {contact.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.lastMessage}
                  </p>
                )}
              </div>

              {/* Unread Count Badge */}
              <ContactUnreadCount contactId={contact.id} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DMContactsList;
