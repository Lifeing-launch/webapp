"use client";

import React, { useState } from "react";
import { GroupsGrid } from "@/components/community-forum/groups-grid";
import { GroupThreads } from "@/components/community-forum/group-threads";
import { ForumGroup, Group } from "@/typing/forum";
import { ForumSidebar } from "@/components/community-forum/forum-sidebar";
import { ForumHeader } from "@/components/community-forum/forum-header";
import SidebarSection from "./sidebar/sidebar-section";
import { CategoryList } from "./sidebar/category-list";

/**
 * Props para o componente GroupsView
 */
export interface IGroupsViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activePage: "Forum" | "Groups" | "Messages";
  setActivePage: React.Dispatch<
    React.SetStateAction<"Forum" | "Groups" | "Messages">
  >;
}

/**
 * Componente para exibir a view dos grupos
 */
export const GroupsView = ({
  searchQuery,
  setSearchQuery,
  activePage,
  setActivePage,
}: IGroupsViewProps) => {
  const [selectedGroup, setSelectedGroup] = useState<ForumGroup | null>(null);

  // My Groups mock data - em produção viria de uma API
  const myGroups: Group[] = [
    {
      id: 1,
      name: "Single 30s Parents",
      avatarColor: "#805B87",
      unreadCount: 3,
    },
    {
      id: 2,
      name: "Solo Parents in Their 30s",
      avatarColor: "#2563eb",
      unreadCount: 0,
    },
  ];

  // Public Groups mock data
  const publicGroups: Group[] = [
    {
      id: 4,
      name: "The Explorers",
      avatarColor: "#16a34a",
    },
    {
      id: 5,
      name: "Curiosity Crew",
      avatarColor: "#f59e0b",
    },
    {
      id: 6,
      name: "Inquiry Squad",
      avatarColor: "#8b5cf6",
    },
    {
      id: 7,
      name: "Question Masters",
      avatarColor: "#dc2626",
    },
    {
      id: 8,
      name: "Answer Alliance",
      avatarColor: "#059669",
    },
    {
      id: 9,
      name: "Discovery Team",
      avatarColor: "#7c3aed",
    },
    {
      id: 10,
      name: "Knowledge Seekers",
      avatarColor: "#e11d48",
    },
  ];

  const handleGroupSelect = (group: ForumGroup) => {
    setSelectedGroup(group);
  };

  return (
    <>
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
        <ForumHeader
          buttonText="Create New Group"
          searchQuery={searchQuery}
          placeholder="Search groups"
          setSearchQuery={setSearchQuery}
        />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ForumSidebar
          isFull={!selectedGroup}
          activePage={activePage}
          setActivePage={setActivePage}
        >
          <div className="flex-1">
            {selectedGroup ? (
              <>
                <SidebarSection title="My Groups">
                  <CategoryList
                    activeCategory={selectedGroup?.name}
                    categories={myGroups.map((group) => group.name)}
                    onCategoryClick={(category) =>
                      handleGroupSelect(
                        myGroups.find(
                          (group) => group.name === category
                        ) as unknown as ForumGroup
                      )
                    }
                  />
                </SidebarSection>
                <SidebarSection title="Public Groups">
                  <CategoryList
                    activeCategory={selectedGroup?.name}
                    categories={publicGroups.map((group) => group.name)}
                    onCategoryClick={(category) =>
                      handleGroupSelect(
                        publicGroups.find(
                          (group) => group.name === category
                        ) as unknown as ForumGroup
                      )
                    }
                  />
                </SidebarSection>
              </>
            ) : (
              <GroupsGrid onGroupSelect={handleGroupSelect} />
            )}
          </div>
        </ForumSidebar>
        {selectedGroup && <GroupThreads />}
      </div>
    </>
  );
};

export default GroupsView;
