"use client";

import React, { useState } from "react";
import { OrganizedGroupsGrid } from "@/components/community-forum/organized-groups-grid";
import { GroupThreads } from "@/components/community-forum/group-threads";
import { GroupWithDetails } from "@/typing/forum";
import { ForumSidebar } from "@/components/community-forum/forum-sidebar";
import { ForumHeader } from "@/components/community-forum/forum-header";
import SidebarSection from "./sidebar/sidebar-section";
import { CategoryList } from "./sidebar/category-list";
import { groupService } from "@/services/forum/group-service";
import { useQuery } from "@tanstack/react-query";
import { useAnonymousProfile } from "@/hooks/use-anonymous-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ChevronLeft, Users } from "lucide-react";
import NewGroupModal from "./new-group-modal";
import { cn } from "@/lib/utils";

export interface IGroupsViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activePage: "Forum" | "Groups" | "Messages";
  setActivePage: React.Dispatch<
    React.SetStateAction<"Forum" | "Groups" | "Messages">
  >;
}

/**
 * Skeleton component for group cards
 */
function GroupCardSkeleton() {
  return (
    <div className="group transition-all duration-200 rounded-lg border bg-card text-card-foreground shadow-sm p-4">
      <div className="flex items-start gap-4">
        {/* Avatar skeleton */}
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Group name skeleton */}
          <Skeleton className="h-4 w-32" />

          {/* Group info skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-1" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Action skeleton */}
          <div className="pt-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Error state component for groups
 */
function GroupsErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Empty state component for groups
 */
function GroupsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-4">
      <Users className="h-16 w-16 text-muted-foreground mb-6" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No Groups Yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Groups help organize conversations around specific topics. Be the first
        to create one!
      </p>
    </div>
  );
}

export const GroupsView = ({
  searchQuery,
  setSearchQuery,
  activePage,
  setActivePage,
}: IGroupsViewProps) => {
  const [selectedGroup, setSelectedGroup] = useState<GroupWithDetails | null>(
    null
  );
  const [openNewGroupModal, setOpenNewGroupModal] = useState(false);
  const { profile } = useAnonymousProfile();

  const {
    data: allAvailableGroups,
    isLoading: isLoadingAllGroups,
    error: allGroupsError,
    isFetched: isAllGroupsFetched,
    refetch: refetchAllGroups,
  } = useQuery({
    queryKey: ["groups", "all-available", searchQuery],
    queryFn: () =>
      groupService.getGroups({
        search: searchQuery || undefined,
      }),
  });

  const {
    data: myMemberGroups,
    isLoading: isLoadingMyGroups,
    refetch: refetchMyGroups,
  } = useQuery({
    queryKey: ["groups", "my-memberships"],
    queryFn: () =>
      groupService.getGroups({
        joinedOnly: true,
      }),
    enabled: !!profile && !!selectedGroup,
  });

  // Organize groups for sidebar display
  const createdGroups = myMemberGroups?.filter(
    (group) => group.owner_anon_id === profile?.id
  );

  const privateGroups = myMemberGroups?.filter(
    (group) =>
      group.group_type === "private" &&
      group.owner_anon_id !== profile?.id &&
      group.is_member
  );

  const publicGroups = myMemberGroups?.filter(
    (group) =>
      group.group_type === "public" &&
      group.owner_anon_id !== profile?.id &&
      group.is_member
  );

  const handleCreateGroup = () => {
    setOpenNewGroupModal(true);
  };

  const handleGroupModalClose = () => {
    setOpenNewGroupModal(false);
  };

  const handleGroupCreated = () => {
    refetchAllGroups();
    refetchMyGroups();
  };

  const handleOpenGroup = (group: { id: string; name: string }) => {
    const foundGroup =
      myMemberGroups?.find((g) => g.id === group.id) ||
      allAvailableGroups?.find((g) => g.id === group.id);
    if (foundGroup) {
      setSelectedGroup(foundGroup);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
        <ForumHeader
          buttonText="Create New Group"
          searchQuery={searchQuery}
          placeholder="Search groups"
          setSearchQuery={setSearchQuery}
          buttonOnClick={handleCreateGroup}
        />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ForumSidebar
          isFull={!selectedGroup}
          activePage={activePage}
          setActivePage={setActivePage}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            {selectedGroup ? (
              <div className="h-full flex flex-col">
                <button
                  className="flex flex-row items-center gap-2 w-full text-left hover:opacity-70 transition-opacity py-2 border-b border-gray-300 pb-3 flex-shrink-0"
                  onClick={() => setSelectedGroup(null)}
                >
                  <ChevronLeft
                    className={cn(
                      "w-3.5 h-3.5 text-zinc-900 transition-transform duration-200"
                    )}
                  />
                  <h3 className="text-xs font-normal leading-none text-zinc-900">
                    Back to all groups
                  </h3>
                </button>

                <div className="flex-1 overflow-y-auto space-y-4 py-2">
                  <SidebarSection title="Groups I Created">
                    <CategoryList
                      activeCategory={selectedGroup?.id}
                      categories={
                        createdGroups?.map((group) => ({
                          id: group.id,
                          name: group.name,
                        })) || []
                      }
                      onCategoryClick={(categoryId) => {
                        setSelectedGroup(
                          createdGroups?.find(
                            (group) => group.id === categoryId
                          ) || null
                        );
                      }}
                      isLoading={isLoadingMyGroups}
                      emptyMessage="No groups created yet"
                    />
                  </SidebarSection>

                  <SidebarSection title="Private Groups">
                    <CategoryList
                      activeCategory={selectedGroup?.id}
                      categories={
                        privateGroups?.map((group) => ({
                          id: group.id,
                          name: group.name,
                        })) || []
                      }
                      onCategoryClick={(categoryId) => {
                        setSelectedGroup(
                          privateGroups?.find(
                            (group) => group.id === categoryId
                          ) || null
                        );
                      }}
                      isLoading={isLoadingMyGroups}
                      emptyMessage="No private groups joined"
                    />
                  </SidebarSection>

                  <SidebarSection title="Public Groups">
                    <CategoryList
                      activeCategory={selectedGroup?.id}
                      categories={
                        publicGroups?.map((group) => ({
                          id: group.id,
                          name: group.name,
                        })) || []
                      }
                      onCategoryClick={(categoryId) => {
                        setSelectedGroup(
                          publicGroups?.find(
                            (group) => group.id === categoryId
                          ) || null
                        );
                      }}
                      isLoading={isLoadingMyGroups}
                      emptyMessage="No public groups joined"
                    />
                  </SidebarSection>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col overflow-hidden">
                {isLoadingAllGroups || !isAllGroupsFetched ? (
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <GroupCardSkeleton key={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : allGroupsError ? (
                  <div className="flex-1 flex items-center justify-center">
                    <GroupsErrorState message="Failed to load groups" />
                  </div>
                ) : allAvailableGroups?.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <GroupsEmptyState />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    <OrganizedGroupsGrid
                      groups={allAvailableGroups || []}
                      onGroupSelect={setSelectedGroup}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </ForumSidebar>

        {selectedGroup && (
          <GroupThreads groupId={selectedGroup.id} searchQuery={searchQuery} />
        )}
      </div>

      <NewGroupModal
        open={openNewGroupModal}
        onClose={handleGroupModalClose}
        revalidate={handleGroupCreated}
        openGroup={handleOpenGroup}
      />
    </>
  );
};

export default GroupsView;
