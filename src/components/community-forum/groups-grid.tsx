import React from "react";
import { GroupCard } from "@/components/community-forum/group-card";
import { GroupJoinRequestAlert } from "@/components/community-forum/group-join-request-alert";
import { ForumGroup, GroupJoinRequest } from "@/typing/forum";

interface GroupsGridProps {
  onGroupSelect?: (group: ForumGroup) => void;
}

/**
 * Groups Grid Component - Shows all available groups
 */
export function GroupsGrid({ onGroupSelect }: GroupsGridProps) {
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

  const groups: ForumGroup[] = [
    {
      id: 1,
      name: "Single 30s Parents",
      description:
        "Are you a single parent in your 30s attempting to cut back or live sober?",
      members: 5,
      posts: 24,
      isPrivate: false,
      isJoined: true,
      isOwner: true,
      joinRequests: joinRequests.filter((req) => req.groupId === 1),
      avatarColor: "#805B87",
    },
    {
      id: 2,
      name: "Solo Parents in Their 30s",
      description:
        "Navigating life as a solo adventurer in your 30s while exploring new hobbies",
      members: 5,
      posts: 18,
      isPrivate: false,
      isJoined: true,
      avatarColor: "#2563eb",
    },
    {
      id: 3,
      name: "Independent Explorers in Their 30s",
      description:
        "Are you a solo traveler in your 30s looking to embrace new experiences?",
      members: 5,
      posts: 12,
      isPrivate: true,
      isJoined: false,
      avatarColor: "#dc2626",
    },
    {
      id: 4,
      name: "Independent Adventurers in Their 30s",
      description:
        "Are you a solo wanderer in your 30s eager to discover fresh paths and opportunities?",
      members: 5,
      posts: 31,
      isPrivate: false,
      isJoined: false,
      avatarColor: "#16a34a",
    },
    {
      id: 5,
      name: "Independent Seekers in Their 30s",
      description:
        "Are you a solo navigator in your 30s ready to chart a course for new horizons?",
      members: 5,
      posts: 15,
      isPrivate: true,
      isJoined: false,
      avatarColor: "#f59e0b",
    },
    {
      id: 6,
      name: "Independent Trailblazers in Their 30s",
      description:
        "Are you a solo explorer in your 30s aiming to uncover hidden gems and experiences?",
      members: 5,
      posts: 22,
      isPrivate: true,
      isJoined: false,
      avatarColor: "#8b5cf6",
    },
  ];

  const totalJoinRequests = joinRequests.length;

  const handleGroupClick = (group: ForumGroup) => {
    if (onGroupSelect) {
      onGroupSelect(group);
    }
  };

  const handleJoinRequest = (groupId: number) => {
    // TODO: Implementar lógica de pedido de entrada
    console.log("Requesting to join group:", groupId);
  };

  const handleJoin = (groupId: number) => {
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
