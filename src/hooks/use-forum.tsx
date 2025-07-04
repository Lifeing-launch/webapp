"use client";

import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/forum";
import { useMemo } from "react";

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
