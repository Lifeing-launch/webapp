import React from "react";
import { GroupCard } from "@/components/community-forum/group-card";
import { GroupJoinRequestAlert } from "@/components/community-forum/group-join-request-alert";
import { ForumGroup, GroupJoinRequest } from "@/typing/forum";

interface GroupsGridProps {
  onGroupSelect?: (group: ForumGroup) => void;
}

interface GroupsGridProps {
  groups: ForumGroup[];
  onGroupSelect?: (group: ForumGroup) => void;
}

export function GroupsGrid({ groups, onGroupSelect }: GroupsGridProps) {
  // Mock data - em produção viria de uma API
  const joinRequests: GroupJoinRequest[] = [
    {
      id: 1,
      userId: 101,
      username: "Alice Johnson",
      userAvatar: "#2563eb",
      requestedAt: "2 hours ago",
      groupId: 1,
      groupName: "Single 30s Parents",
    },
    {
      id: 2,
      userId: 102,
      username: "Bob Smith",
      userAvatar: "#dc2626",
      requestedAt: "1 day ago",
      groupId: 3,
      groupName: "Independent Explorers in Their 30s",
    },
    {
      id: 3,
      userId: 103,
      username: "Carol White",
      userAvatar: "#16a34a",
      requestedAt: "3 hours ago",
      groupId: 1,
      groupName: "Single 30s Parents",
    },
  ];

  const totalJoinRequests = joinRequests.length;

  const handleGroupClick = (group: ForumGroup) => {
    if (onGroupSelect) {
      onGroupSelect(group);
    }
  };

  const handleJoinRequest = (groupId: string) => {
    // TODO: Implementar lógica de pedido de entrada
    console.log("Requesting to join group:", groupId);
  };

  const handleJoin = (groupId: string) => {
    // TODO: Implementar lógica de entrada direta
    console.log("Joining group:", groupId);
  };

  const handleViewRequests = () => {
    // TODO: Implementar lógica para visualizar pedidos
    console.log("View join requests");
  };

  return (
    <div className="flex-1 bg-gray-50/50">
      <div className="space-y-6">
        {/* Alert for join requests */}
        {totalJoinRequests > 0 && (
          <GroupJoinRequestAlert
            requestCount={totalJoinRequests}
            onViewRequests={handleViewRequests}
          />
        )}

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => handleGroupClick(group)}
              onJoin={() => handleJoin(group.id)}
              onRequestJoin={() => handleJoinRequest(group.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
