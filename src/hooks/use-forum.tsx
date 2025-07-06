"use client";

import { useQuery } from "@tanstack/react-query";
import { postService, groupService } from "@/services/forum";
import { useMemo } from "react";
import { getQueryClient } from "@/components/providers/query-provider";

export type UseForumPostsOptions = {
  groupId?: string;
  limit?: number;
  offset?: number;
  searchQuery?: string;
  tagId?: string | null;
  categoryId?: string | null;
  onlyForum?: boolean;
};

export function useForumPosts(options: UseForumPostsOptions = {}) {
  const { groupId, limit, offset, searchQuery, tagId, categoryId, onlyForum } =
    options;

  const postsQueryKey = useMemo(
    () => [
      "forum-posts",
      { groupId, limit, offset, searchQuery, tagId, categoryId, onlyForum },
    ],
    [groupId, limit, offset, searchQuery, tagId, categoryId, onlyForum]
  );

  const posts = useQuery({
    queryKey: postsQueryKey,
    queryFn: () =>
      postService.getPosts({
        groupId,
        limit,
        offset,
        searchQuery,
        tagId: tagId ?? undefined,
        categoryId: categoryId ?? undefined,
        onlyForum,
      }),
  });

  const tags = useQuery({
    queryKey: ["tags"],
    queryFn: () => postService.getTags(),
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => postService.getCategories(),
  });

  return {
    posts,
    tags,
    categories,
  };
}

/**
 * Hook to fetch all pending join requests for groups owned by current user
 */
export function usePendingJoinRequests() {
  return useQuery({
    queryKey: ["pending-join-requests"],
    queryFn: async () => {
      return await groupService.getAllPendingJoinRequests();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes to keep data fresh
  });
}

/**
 * Hook to manage group member operations with proper cache invalidation
 */
export function useGroupMemberActions() {
  const queryClient = getQueryClient();

  const approveGroupMember = async (groupId: string, memberId: string) => {
    await groupService.approveGroupMember(groupId, memberId);

    // Invalidate cache to refresh data
    queryClient.invalidateQueries({
      queryKey: ["pending-join-requests"],
    });

    // Also invalidate groups cache if needed
    queryClient.invalidateQueries({
      queryKey: ["groups"],
    });
  };

  const removeGroupMember = async (groupId: string, memberId: string) => {
    await groupService.removeGroupMember(groupId, memberId);

    // Invalidate cache to refresh data
    queryClient.invalidateQueries({
      queryKey: ["pending-join-requests"],
    });

    // Also invalidate groups cache if needed
    queryClient.invalidateQueries({
      queryKey: ["groups"],
    });
  };

  return {
    approveGroupMember,
    removeGroupMember,
  };
}
