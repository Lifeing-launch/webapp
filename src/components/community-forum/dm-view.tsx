import { ForumHeader } from "@/components/community-forum/forum-header";
import { ForumSidebar } from "@/components/community-forum/forum-sidebar";
import { DMContactsList } from "@/components/community-forum/dm-contacts-list";
import { DMMessagesList } from "@/components/community-forum/dm-messages-list";
import { DMMessageInput } from "@/components/community-forum/dm-message-input";
// import { useDirectMessages } from "@/hooks/use-direct-messages";

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
 * Componente para exibir a view de mensagens diretas
 */
export const DMView = ({ activePage, setActivePage }: IDMViewProps) => {
  // const {
  //   contacts,
  //   messages,
  //   selectedContactId,
  //   isLoading,
  //   handleContactSelect,
  //   handleSendMessage,
  // } = useDirectMessages();

  const contacts = [];
  const messages = [];
  const selectedContactId = undefined;
  const isLoading = false;
  const handleContactSelect = () => {};
  const handleSendMessage = () => {};

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
        <ForumHeader
          searchQuery=""
          placeholder="Search messages or people"
          hiddenButton={true}
          setSearchQuery={() => {}}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ForumSidebar activePage={activePage} setActivePage={setActivePage}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">
                Loading contacts...
              </div>
            </div>
          ) : (
            <DMContactsList
              contacts={contacts}
              selectedContactId={selectedContactId || undefined}
              onContactSelect={handleContactSelect}
            />
          )}
        </ForumSidebar>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <DMMessagesList messages={messages} />
          </div>

          {/* Message Input */}
          <div className="border-t border-border px-4 py-3">
            <DMMessageInput
              onSendMessage={handleSendMessage}
              disabled={!selectedContactId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DMView;
