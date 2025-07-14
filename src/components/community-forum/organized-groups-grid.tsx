import React from "react";
import { GroupCard } from "@/components/community-forum/group-card";
import { GroupJoinRequestAlert } from "@/components/community-forum/group-join-request-alert";
import { JoinRequestsModal } from "@/components/community-forum/join-requests-modal";
import { GroupWithDetails } from "@/typing/forum";
import { usePendingJoinRequests } from "@/hooks/use-forum";
import { getQueryClient } from "@/components/providers/query-provider";
import { groupService } from "@/services/forum";
import { useAnonymousProfile } from "@/hooks/use-anonymous-profile";

interface OrganizedGroupsGridProps {
  groups: GroupWithDetails[];
  onGroupSelect?: (group: GroupWithDetails) => void;
}

export function OrganizedGroupsGrid({
  groups,
  onGroupSelect,
}: OrganizedGroupsGridProps) {
  const queryClient = getQueryClient();
  const { profile } = useAnonymousProfile();

  // Track loading states for each group
  const [loadingGroups, setLoadingGroups] = React.useState<Set<string>>(
    new Set()
  );

  // Modal state
  const [isJoinRequestsModalOpen, setIsJoinRequestsModalOpen] =
    React.useState(false);

  // Fetch real pending join requests
  const {
    data: pendingRequests,
    isLoading: isLoadingRequests,
    error: requestsError,
  } = usePendingJoinRequests();

  // Organize groups into categories
  const organizedGroups = React.useMemo(() => {
    if (!groups || !profile) {
      return {
        createdByMe: [],
        joinedGroups: [],
        availableGroups: [],
      };
    }

    const createdByMe = groups.filter(
      (group) => group.owner_anon_id === profile.id
    );

    const joinedGroups = groups.filter(
      (group) =>
        group.owner_anon_id !== profile.id &&
        group.is_member &&
        group.member_status === "approved"
    );

    const availableGroups = groups.filter(
      (group) =>
        group.owner_anon_id !== profile.id &&
        (!group.is_member || group.member_status !== "approved")
    );

    return {
      createdByMe,
      joinedGroups,
      availableGroups,
    };
  }, [groups, profile]);

  const handleGroupClick = (group: GroupWithDetails) => {
    if (onGroupSelect) {
      onGroupSelect(group);
    }
  };

  const setGroupLoading = (groupId: string, isLoading: boolean) => {
    setLoadingGroups((prev) => {
      const newSet = new Set(prev);
      if (isLoading) {
        newSet.add(groupId);
      } else {
        newSet.delete(groupId);
      }
      return newSet;
    });
  };

  const handleJoinRequest = async (groupId: string) => {
    try {
      setGroupLoading(groupId, true);
      await groupService.joinGroup(groupId);

      // Invalidate cache to refresh data
      queryClient.invalidateQueries({
        queryKey: ["groups"],
      });

      console.log("Successfully requested to join group:", groupId);
    } catch (error) {
      console.error("Error requesting to join group:", error);
    } finally {
      setGroupLoading(groupId, false);
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      setGroupLoading(groupId, true);
      await groupService.joinGroup(groupId);

      // Invalidate cache to refresh data
      queryClient.invalidateQueries({
        queryKey: ["groups"],
      });

      console.log("Successfully joined group:", groupId);
    } catch (error) {
      console.error("Error joining group:", error);
    } finally {
      setGroupLoading(groupId, false);
    }
  };

  const handleViewRequests = () => {
    setIsJoinRequestsModalOpen(true);
  };

  const handleRequestProcessed = () => {
    // Invalidate cache to refresh data
    queryClient.invalidateQueries({
      queryKey: ["pending-join-requests"],
    });
    queryClient.invalidateQueries({
      queryKey: ["groups"],
    });
  };

  // Don't show join request alert if there are no requests or if loading/error
  const shouldShowJoinRequestAlert =
    !isLoadingRequests &&
    !requestsError &&
    pendingRequests &&
    pendingRequests.length > 0;

  const renderGroupsSection = (title: string, groups: GroupWithDetails[]) => {
    if (groups.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <span className="text-sm text-muted-foreground">
            ({groups.length})
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {groups.map((group) => (
            <div key={group.id} className="min-h-[180px] flex">
              <GroupCard
                group={group}
                onClick={() => handleGroupClick(group)}
                onJoin={() => handleJoin(group.id)}
                onRequestJoin={() => handleJoinRequest(group.id)}
                isJoinLoading={loadingGroups.has(group.id)}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50/50 h-full">
      <div className="space-y-8 p-1 pb-4">
        {/* Alert for join requests */}
        {shouldShowJoinRequestAlert && (
          <GroupJoinRequestAlert
            requestCount={pendingRequests.length}
            onViewRequests={handleViewRequests}
          />
        )}

        {/* Groups I Created */}
        {renderGroupsSection("Groups I Created", organizedGroups.createdByMe)}

        {/* Groups I Joined */}
        {renderGroupsSection("Groups I Joined", organizedGroups.joinedGroups)}

        {/* Available Groups */}
        {renderGroupsSection(
          "Available Groups",
          organizedGroups.availableGroups
        )}

        {/* Empty state when no groups */}
        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-lg font-semibold text-foreground mb-2">
              No Groups Found
            </div>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or create a new group to get started.
            </p>
          </div>
        )}

        {/* Join Requests Modal */}
        <JoinRequestsModal
          open={isJoinRequestsModalOpen}
          onOpenChange={setIsJoinRequestsModalOpen}
          requests={pendingRequests || []}
          onRequestProcessed={handleRequestProcessed}
        />
      </div>
    </div>
  );
}
