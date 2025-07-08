import { ForumHeader } from "@/components/community-forum/forum-header";
import { ForumSidebar } from "@/components/community-forum/forum-sidebar";
import { DMContactsList } from "@/components/community-forum/dm-contacts-list";
import { DMMessagesList } from "@/components/community-forum/dm-messages-list";
import { DMMessageInput } from "@/components/community-forum/dm-message-input";
import { useDirectMessages, useAnonymousProfiles } from "@/hooks/use-forum";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { MessageWithDetails, DMContact } from "@/typing/forum";

/**
 * Props para o componente DMView
 */
export interface IDMViewProps {
  activePage: "Forum" | "Groups" | "Messages";
  setActivePage: React.Dispatch<
    React.SetStateAction<"Forum" | "Groups" | "Messages">
  >;
}

/**
 * Transforma MessageWithDetails em DMContact para compatibilidade
 */
function transformToDMContact(
  message: MessageWithDetails,
  currentProfileId?: string
): DMContact {
  const isFromCurrentUser = message.sender_anon_id === currentProfileId;
  const contactProfile = isFromCurrentUser
    ? message.receiver_profile
    : message.sender_profile;

  return {
    id: contactProfile.id,
    username: contactProfile.nickname,
    avatarColor: "bg-primary",
    lastMessage: message.content,
    lastMessageTime: message.created_at,
    unreadCount: 0, // TODO: implementar contagem
    isActive: true,
  };
}

/**
 * Componente para exibir loading state dos contatos
 */
function ContactsLoading() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Componente para buscar novos usuários
 */
function NewConversationPanel({
  searchQuery,
  onSearchChange,
  onUserSelect,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUserSelect: (userId: string) => void;
}) {
  const { data: profiles, isLoading } = useAnonymousProfiles(searchQuery);

  return (
    <div className="border-t border-border p-4">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <UserPlus className="h-4 w-4" />
        Start New Conversation
      </h3>

      <input
        type="text"
        placeholder="Search for users..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {searchQuery && (
        <div className="mt-2 max-h-40 overflow-y-auto">
          {isLoading ? (
            <div className="py-2 text-xs text-muted-foreground">
              Searching...
            </div>
          ) : profiles && profiles.length > 0 ? (
            <div className="space-y-1">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => onUserSelect(profile.id)}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md"
                >
                  @{profile.nickname}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-2 text-xs text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Componente para exibir estado vazio das mensagens
 */
function MessagesEmptyState({
  selectedContactId,
}: {
  selectedContactId: string | null;
}) {
  if (!selectedContactId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Welcome to Messages
          </h3>
          <p className="text-sm text-muted-foreground">
            Select a conversation from the sidebar or start a new one to begin
            messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 text-center">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No messages yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Be the first to send a message in this conversation.
        </p>
      </div>
    </div>
  );
}

/**
 * Componente para exibir a view de mensagens diretas
 */
export const DMView = ({ activePage, setActivePage }: IDMViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const {
    contacts,
    messages,
    selectedContactId,
    isContactsLoading,
    isMessagesLoading,
    isSending,
    handleContactSelect,
    handleSendMessage,
  } = useDirectMessages();

  const handleUserSelect = (userId: string) => {
    handleContactSelect(userId);
    setUserSearchQuery("");
  };

  // Transformar contacts para o formato esperado pelo componente
  const transformedContacts = contacts.map((contact) =>
    transformToDMContact(contact)
  );

  const filteredContacts = transformedContacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSelectWithTransform = (contactId: string) => {
    // Encontrar o contact original pelo ID transformado
    const originalContact = contacts.find(
      (contact) => transformToDMContact(contact).id === contactId
    );
    if (originalContact) {
      const isFromCurrentUser =
        originalContact.sender_anon_id === selectedContactId;
      const targetContactId = isFromCurrentUser
        ? originalContact.receiver_anon_id
        : originalContact.sender_anon_id;
      handleContactSelect(targetContactId);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
        <ForumHeader
          searchQuery={searchQuery}
          placeholder="Search messages or people"
          hiddenButton={true}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ForumSidebar activePage={activePage} setActivePage={setActivePage}>
          {isContactsLoading ? (
            <ContactsLoading />
          ) : (
            <>
              <DMContactsList
                contacts={filteredContacts}
                selectedContactId={
                  selectedContactId ? selectedContactId : undefined
                }
                onContactSelect={handleContactSelectWithTransform}
              />

              <NewConversationPanel
                searchQuery={userSearchQuery}
                onSearchChange={setUserSearchQuery}
                onUserSelect={handleUserSelect}
              />
            </>
          )}
        </ForumSidebar>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            {isMessagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-muted-foreground">
                  Loading messages...
                </div>
              </div>
            ) : messages.length > 0 ? (
              <div className="px-4 py-3">
                <DMMessagesList messages={messages} />
              </div>
            ) : (
              <MessagesEmptyState selectedContactId={selectedContactId} />
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-border px-4 py-3">
            <DMMessageInput
              onSendMessage={handleSendMessage}
              disabled={!selectedContactId || isSending}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DMView;
