"use client";

import React, { useState } from "react";
import { GroupsGrid } from "@/components/community-forum/groups-grid";
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
import { AlertTriangle, Users } from "lucide-react";
import NewGroupModal from "./new-group-modal";

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

/**
 * Loading state component for groups grid
 */
function GroupsGridSkeleton() {
  return (
    <div className="flex-1 bg-gray-50/50">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      </div>
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

  const myGroups = myMemberGroups?.filter(
    (group) =>
      // Groups owned by the user (any type)
      group.owner_anon_id === profile?.id ||
      // Private groups where user is an approved member
      (group.group_type === "private" && group.is_member)
  );

  const publicGroups = myMemberGroups?.filter(
    (group) =>
      // Public groups where user is approved member but not owner
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
          <div className="flex-1">
            {selectedGroup ? (
              <>
                <SidebarSection title="My Groups">
                  <CategoryList
                    activeCategory={selectedGroup?.id}
                    categories={
                      myGroups?.map((group) => ({
                        id: group.id,
                        name: group.name,
                      })) || []
                    }
                    onCategoryClick={(categoryId) => {
                      setSelectedGroup(
                        myGroups?.find((group) => group.id === categoryId) ||
                          null
                      );
                    }}
                    isLoading={isLoadingMyGroups}
                    emptyMessage="No private groups or owned groups"
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
              </>
            ) : (
              <>
                {isLoadingAllGroups || !isAllGroupsFetched ? (
                  <GroupsGridSkeleton />
                ) : allGroupsError ? (
                  <GroupsErrorState message="Failed to load groups" />
                ) : allAvailableGroups?.length === 0 ? (
                  <GroupsEmptyState />
                ) : (
                  <GroupsGrid
                    groups={allAvailableGroups || []}
                    onGroupSelect={setSelectedGroup}
                  />
                )}
              </>
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
