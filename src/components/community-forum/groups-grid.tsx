import React from "react";
import { GroupCard } from "@/components/community-forum/group-card";
import { GroupJoinRequestAlert } from "@/components/community-forum/group-join-request-alert";
import { GroupWithDetails } from "@/typing/forum";
import { usePendingJoinRequests } from "@/hooks/use-forum";
import { getQueryClient } from "@/components/providers/query-provider";
import { groupService } from "@/services/forum";

interface GroupsGridProps {
  groups: GroupWithDetails[];
  onGroupSelect?: (group: GroupWithDetails) => void;
}

export function GroupsGrid({ groups, onGroupSelect }: GroupsGridProps) {
  const queryClient = getQueryClient();

  // Track loading states for each group
  const [loadingGroups, setLoadingGroups] = React.useState<Set<string>>(
    new Set()
  );

  // Fetch real pending join requests
  const {
    data: pendingRequests,
    isLoading: isLoadingRequests,
    error: requestsError,
  } = usePendingJoinRequests();

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
    // TODO: Implementar lógica para visualizar pedidos
    console.log("View join requests");
    console.log("Pending requests:", pendingRequests);
  };

  // Don't show join request alert if there are no requests or if loading/error
  const shouldShowJoinRequestAlert =
    !isLoadingRequests &&
    !requestsError &&
    pendingRequests &&
    pendingRequests.length > 0;

  // Debug logging
  React.useEffect(() => {
    console.log("Groups Grid - Pending requests state:", {
      isLoading: isLoadingRequests,
      error: requestsError,
      data: pendingRequests,
      count: pendingRequests?.length || 0,
    });
  }, [isLoadingRequests, requestsError, pendingRequests]);

  return (
    <div className="flex-1 bg-gray-50/50">
      <div className="space-y-6">
        {/* Alert for join requests */}
        {shouldShowJoinRequestAlert && (
          <GroupJoinRequestAlert
            requestCount={pendingRequests.length}
            onViewRequests={handleViewRequests}
          />
        )}

        {/* Groups Grid */}
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
    </div>
  );
}
