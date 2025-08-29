import { ForumHeader } from "@/components/community-forum/forum-header";
import { ForumSidebar } from "@/components/community-forum/forum-sidebar";
import { DMContactsList } from "@/components/community-forum/dm-contacts-list";
import { DMMessagesList } from "@/components/community-forum/dm-messages-list";
import { DMMessageInput } from "@/components/community-forum/dm-message-input";
import { NewConversationPanel } from "@/components/community-forum/new-conversation-panel";
import { SearchDropdown } from "@/components/community-forum/search-dropdown";
import { useDirectMessages, useSearch } from "@/hooks/use-forum";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import {
  MessageWithDetails,
  DMContact,
  AnonymousProfile,
} from "@/typing/forum";
import { profileService } from "@/services/forum";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isSelectingNewContact, setIsSelectingNewContact] = useState(false);
  const [selectingUserId, setSelectingUserId] = useState<string | undefined>();
  const [newContactProfile, setNewContactProfile] = useState<{
    id: string;
    nickname: string;
  } | null>(null);
  const [showNewConversationPanel, setShowNewConversationPanel] =
    useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const {
    contacts,
    messages,
    selectedContactId,
    isContactsLoading,
    isMessagesLoading,
    isSending,
    handleContactSelect,
    handleClearSelection,
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

  // Transformar contacts para o formato esperado pelo componente
  const transformedContacts = currentProfileId
    ? contacts.map((contact) => transformToDMContact(contact, currentProfileId))
    : [];

  const handleContactSelectWithMenuClose = (contactId: string) => {
    handleContactSelect(contactId);
    setOpenMobileMenu(false);
  };

  const handleUserSelect = async (userId: string, nickname: string) => {
    setIsSelectingNewContact(true);
    setSelectingUserId(userId);
    try {
      // Check if conversation already exists
      const existingContact = transformedContacts.find((c) => c.id === userId);
      if (existingContact) {
        // Redirect to existing conversation
        handleContactSelectWithMenuClose(userId);
        setShowNewConversationPanel(false);
        return;
      }

      // Store the new contact profile for new conversation
      setNewContactProfile({ id: userId, nickname });
      handleContactSelectWithMenuClose(userId);
      setShowNewConversationPanel(false);
    } finally {
      setIsSelectingNewContact(false);
      setSelectingUserId(undefined);
    }
  };

  const handleNewConversationClick = () => {
    setShowNewConversationPanel(true);
  };

  const handleBackToMessages = () => {
    // Reset all DM state to initial state
    setShowNewConversationPanel(false);
    setNewContactProfile(null);
    setIsSelectingNewContact(false);
    setSelectingUserId(undefined);
    // Clear the selected contact
    handleClearSelection();
  };

  // Search functionality
  const {
    people,
    messages: searchMessages,
    isLoading: isSearchLoading,
  } = useSearch(searchQuery);

  const handlePersonSelectFromSearch = (profile: AnonymousProfile) => {
    handleUserSelect(profile.id, profile.nickname);
    // Clear search query to close dropdown
    setSearchQuery("");
  };

  const handleMessageSelectFromSearch = (message: MessageWithDetails) => {
    // Determine the contact ID based on current user
    const contactId =
      message.sender_anon_id === currentProfileId
        ? message.receiver_anon_id
        : message.sender_anon_id;

    handleContactSelect(contactId);
    // Clear search query to close dropdown
    setSearchQuery("");
  };

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

  // Remove filteredContacts - search should only affect dropdown, not sidebar

  // Encontrar o nome do contato selecionado
  const selectedContact = uniqueContacts.find(
    (c) => c.id === selectedContactId
  );

  const sidebarContent = isContactsLoading ? (
    <ContactsLoading />
  ) : (
    <>
      <DMContactsList
        contacts={uniqueContacts}
        selectedContactId={selectedContactId || undefined}
        onContactSelect={handleContactSelectWithMenuClose}
      />
    </>
  );

  return (
    <>
      <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
        <SheetContent side="left" className="w-[300px] p-0">
          <ForumSidebar
            activePage={activePage}
            setActivePage={setActivePage}
            isFull={true}
            onItemClick={() => setOpenMobileMenu(false)}
          >
            {sidebarContent}
          </ForumSidebar>
        </SheetContent>
      </Sheet>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
        <ForumHeader
          searchQuery={searchQuery}
          placeholder="Search messages or people"
          buttonText="New Message"
          buttonIcon={<Plus className="h-4 w-4" />}
          buttonOnClick={handleNewConversationClick}
          setSearchQuery={setSearchQuery}
          onMenuClick={() => setOpenMobileMenu(true)}
          showMenuButton={true}
          searchDropdown={
            <SearchDropdown
              searchQuery={searchQuery}
              searchResults={{ people, messages: searchMessages }}
              isLoading={isSearchLoading}
              onPersonSelect={handlePersonSelectFromSearch}
              onMessageSelect={handleMessageSelectFromSearch}
            />
          }
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ForumSidebar activePage={activePage} setActivePage={setActivePage}>
          {sidebarContent}
        </ForumSidebar>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showNewConversationPanel ? (
            <NewConversationPanel
              onUserSelect={handleUserSelect}
              onBack={handleBackToMessages}
              isSelecting={isSelectingNewContact}
              selectedUserId={selectingUserId}
            />
          ) : (
            <>
              {/* Selected Contact Header */}
              {selectedContact && (
                <div className="border-b border-border px-2 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToMessages}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
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
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DMView;
