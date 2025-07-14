import React from "react";
import { MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnonymousProfile, MessageWithDetails } from "@/typing/forum";
import { formatTimeAgo } from "@/utils/datetime";

interface SearchResult {
  people: AnonymousProfile[];
  messages: MessageWithDetails[];
}

interface SearchDropdownProps {
  searchQuery: string;
  searchResults: SearchResult;
  isLoading: boolean;
  onPersonSelect: (profile: AnonymousProfile) => void;
  onMessageSelect: (message: MessageWithDetails) => void;
  className?: string;
}

export function SearchDropdown({
  searchQuery,
  searchResults,
  isLoading,
  onPersonSelect,
  onMessageSelect,
  className,
}: SearchDropdownProps) {
  const { people, messages } = searchResults;

  if (!searchQuery || searchQuery.length < 2) {
    return null;
  }

  const hasResults = people.length > 0 || messages.length > 0;

  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-border rounded-md shadow-lg max-h-96 overflow-y-auto",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-muted-foreground">Searching...</div>
        </div>
      ) : hasResults ? (
        <div className="py-2">
          {/* People Section */}
          {people.length > 0 && (
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                People
              </div>
              <div className="space-y-1">
                {people.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => onPersonSelect(person)}
                    className="w-full flex items-center gap-3 px-2 py-2 hover:bg-accent rounded-md transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {person.nickname.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        @{person.nickname}
                      </div>
                    </div>
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Section */}
          {messages.length > 0 && (
            <div className="px-3 py-2">
              {people.length > 0 && (
                <div className="border-t border-border my-2" />
              )}
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Messages
              </div>
              <div className="space-y-1">
                {messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => onMessageSelect(message)}
                    className="w-full flex items-start gap-3 px-2 py-2 hover:bg-accent rounded-md transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                      {message.sender_profile.nickname
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground truncate">
                          @{message.sender_profile.nickname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(message.created_at)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </div>
                    </div>
                    <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-muted-foreground">
            No results found for &quot;{searchQuery}&quot;
          </div>
        </div>
      )}
    </div>
  );
}
