"use client";

import React, { useState } from "react";
import PageTemplate from "@/components/layout/page-template";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import { WelcomeBanner } from "@/components/community-forum/welcome-banner";
import { AnonymousProfileProvider } from "@/hooks/use-anonymous-profile";

import { GroupsView } from "@/components/community-forum/groups-view";
import { DMView } from "@/components/community-forum/dm-view";
import { ForumView } from "@/components/community-forum/forum-view";
import NicknameSetupModal from "@/components/community-forum/nickname-setup-modal";

const TABS = {
  forum: ForumView,
  groups: GroupsView,
  messages: DMView,
};

/**
 * Lifeing Lounge Page
 */
function CommunityForum() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setActivePage] = useState<"Forum" | "Groups" | "Messages">(
    "Forum"
  );

  const renderContent = () => {
    switch (activePage) {
      case "Groups":
        return (
          <TABS.groups
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activePage={activePage}
            setActivePage={setActivePage}
          />
        );
      case "Messages":
        return (
          <TABS.messages
            activePage={activePage}
            setActivePage={setActivePage}
          />
        );
      case "Forum":
      default:
        return (
          <TABS.forum
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activePage={activePage}
            setActivePage={setActivePage}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden w-full">
      <div className="flex-shrink-0">
        <PageTemplate
          hiddenTitle={true}
          title="Lifeing Lounge"
          headerIcon={sidebarIcons.communityForum}
          breadcrumbs={[{ label: "Lifeing Lounge" }]}
          classNameChildren="px-0"
        >
          <div className="px-4">
            <WelcomeBanner />
          </div>
        </PageTemplate>
      </div>
      {renderContent()}
      <NicknameSetupModal />
    </div>
  );
}

function CommunityForumPage() {
  return (
    <AnonymousProfileProvider>
      <CommunityForum />
    </AnonymousProfileProvider>
  );
}

export default CommunityForumPage;
