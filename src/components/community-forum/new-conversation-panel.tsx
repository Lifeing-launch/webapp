import { useState } from "react";
import { useAnonymousProfiles } from "@/hooks/use-forum";
import { Search, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnonymousProfile } from "@/typing/forum";
import { getAvatarBackgroundStyle } from "@/utils/forum-avatar-colors";

interface NewConversationPanelProps {
  onUserSelect: (userId: string, nickname: string) => void;
  onBack: () => void;
  isSelecting: boolean;
  selectedUserId?: string;
}

export function NewConversationPanel({
  onUserSelect,
  onBack,
  isSelecting,
  selectedUserId,
}: NewConversationPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: profiles, isLoading } = useAnonymousProfiles(searchQuery);

  const handleUserSelect = (profile: AnonymousProfile) => {
    onUserSelect(profile.id, profile.nickname);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={isSelecting}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">New Conversation</h2>
            <p className="text-sm text-muted-foreground">
              Search for a user to start messaging
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
            disabled={isSelecting}
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {!searchQuery || searchQuery.length < 2 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Find Someone to Message
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Type at least 2 characters to search for users you&apos;d like to
              start a conversation with.
            </p>
          </div>
        ) : (
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  Searching for users...
                </div>
              </div>
            ) : profiles && profiles.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground mb-3">
                  {profiles.length} user{profiles.length !== 1 ? "s" : ""} found
                </div>
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleUserSelect(profile)}
                    disabled={isSelecting}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors text-left",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className="h-10 w-10 rounded-full text-white flex items-center justify-center text-sm font-medium flex-shrink-0"
                      style={getAvatarBackgroundStyle(profile.id)}
                    >
                      {profile.nickname.slice(0, 2).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          @{profile.nickname}
                        </h4>
                        {isSelecting && selectedUserId === profile.id && (
                          <span className="text-xs text-muted-foreground">
                            Starting chat...
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  No users found
                </div>
                <p className="text-xs text-muted-foreground">
                  Try searching with a different username
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
