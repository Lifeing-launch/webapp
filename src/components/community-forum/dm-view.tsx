import { ForumHeader } from "@/components/community-forum/forum-header";
import { ForumSidebar } from "@/components/community-forum/forum-sidebar";
import { DMContactsList } from "@/components/community-forum/dm-contacts-list";
import { DMMessagesList } from "@/components/community-forum/dm-messages-list";
import { DMMessageInput } from "@/components/community-forum/dm-message-input";
import { useDirectMessages, useAnonymousProfiles } from "@/hooks/use-forum";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { MessageWithDetails, DMContact } from "@/typing/forum";
import { profileService } from "@/services/forum";
import { Button } from "@/components/ui/button";

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
  currentProfileId: string
): DMContact {
  // Determina quem é o contato baseado no perfil atual
  const isFromCurrentUser = message.sender_anon_id === currentProfileId;
  const contactProfile = isFromCurrentUser
    ? message.receiver_profile
    : message.sender_profile;

  const contactId = isFromCurrentUser
    ? message.receiver_anon_id
    : message.sender_anon_id;

  return {
    id: contactId, // Usar o ID correto do contato
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
  // onClose,
  isSelecting,
  selectedUserId,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUserSelect: (userId: string, nickname: string) => void;
  onClose: () => void;
  isSelecting: boolean;
  selectedUserId?: string;
}) {
  const { data: profiles, isLoading } = useAnonymousProfiles(searchQuery);

  return (
    <div className="border-t border-border p-4 min-h-[7.4rem]">
      {/* <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Start New Conversation
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
          disabled={isSelecting}
        >
          <X className="h-4 w-4" />
        </Button>
      </div> */}

      <input
        type="text"
        placeholder="Search for users..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
        autoFocus
        disabled={isSelecting}
      />

      {searchQuery && searchQuery.length >= 2 && (
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
                  onClick={() => {
                    onUserSelect(profile.id, profile.nickname);
                  }}
                  disabled={isSelecting}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                >
                  <span>@{profile.nickname}</span>
                  {isSelecting && selectedUserId === profile.id && (
                    <span className="text-xs text-muted-foreground">
                      Loading...
                    </span>
                  )}
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
  selectedContactName,
}: {
  selectedContactId: string | null;
  selectedContactName?: string;
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
          {selectedContactName
            ? `Start a conversation with @${selectedContactName}`
            : "No messages yet"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {selectedContactName
            ? "Send your first message to start chatting."
            : "Be the first to send a message in this conversation."}
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
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isSelectingNewContact, setIsSelectingNewContact] = useState(false);
  const [selectingUserId, setSelectingUserId] = useState<string | undefined>();
  const [newContactProfile, setNewContactProfile] = useState<{
    id: string;
    nickname: string;
  } | null>(null);

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

  // Buscar o perfil atual do usuário
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const profile = await profileService.getCurrentProfile();
        if (profile) {
          setCurrentProfileId(profile.id);
        }
      } catch (error) {
        console.error("Error fetching current profile:", error);
      }
    };
    fetchCurrentProfile();
  }, []);

  const handleUserSelect = async (userId: string, nickname: string) => {
    setIsSelectingNewContact(true);
    setSelectingUserId(userId);
    try {
      // Store the new contact profile
      setNewContactProfile({ id: userId, nickname });
      await handleContactSelect(userId);
      setUserSearchQuery("");
      setShowNewConversation(false);
    } finally {
      setIsSelectingNewContact(false);
      setSelectingUserId(undefined);
    }
  };

  // Transformar contacts para o formato esperado pelo componente
  const transformedContacts = currentProfileId
    ? contacts.map((contact) => transformToDMContact(contact, currentProfileId))
    : [];

  // Add new contact if selected but no messages yet
  if (newContactProfile && selectedContactId === newContactProfile.id) {
    const existingContact = transformedContacts.find(
      (c) => c.id === newContactProfile.id
    );

    if (!existingContact) {
      transformedContacts.unshift({
        id: newContactProfile.id,
        username: newContactProfile.nickname,
        avatarColor: "bg-primary",
        lastMessage: "",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isActive: true,
      });
    }
  }

  // Remover duplicatas baseadas no ID do contato
  const uniqueContacts = transformedContacts.reduce((acc, contact) => {
    const exists = acc.find((c) => c.id === contact.id);
    if (!exists) {
      acc.push(contact);
    }
    return acc;
  }, [] as DMContact[]);

  const filteredContacts = uniqueContacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Encontrar o nome do contato selecionado
  const selectedContact = uniqueContacts.find(
    (c) => c.id === selectedContactId
  );

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
          {/* Botão para nova conversa */}
          {/* <div className="p-4 border-b border-border">
            <Button
              onClick={() => setShowNewConversation(!showNewConversation)}
              className="w-full"
              variant="outline"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </div> */}

          {isContactsLoading ? (
            <ContactsLoading />
          ) : (
            <>
              <DMContactsList
                contacts={filteredContacts}
                selectedContactId={selectedContactId || undefined}
                onContactSelect={handleContactSelect}
              />

              {/* {showNewConversation && ( */}
              <NewConversationPanel
                searchQuery={userSearchQuery}
                onSearchChange={setUserSearchQuery}
                onUserSelect={handleUserSelect}
                onClose={() => setShowNewConversation(false)}
                isSelecting={isSelectingNewContact}
                selectedUserId={selectingUserId}
              />
              {/* )} */}
            </>
          )}
        </ForumSidebar>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Selected Contact Header */}
          {selectedContact && (
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-lg font-semibold">
                @{selectedContact.username}
              </h2>
            </div>
          )}

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
              <MessagesEmptyState
                selectedContactId={selectedContactId}
                selectedContactName={selectedContact?.username}
              />
            )}
          </div>

          {/* Message Input */}
          {selectedContactId && (
            <div className="border-t border-border px-4 py-3">
              <DMMessageInput
                onSendMessage={handleSendMessage}
                disabled={!selectedContactId || isSending}
                recipientName={selectedContact?.username}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DMView;
