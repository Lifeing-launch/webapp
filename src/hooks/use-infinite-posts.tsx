import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { postService } from "@/services/forum";
import { PostWithDetails } from "@/typing/forum";

export interface UseInfinitePostsOptions {
  groupId?: string;
  searchQuery?: string;
  tagId?: string;
  categoryId?: string;
  onlyForum?: boolean;
  enabled?: boolean;
  limit?: number;
}

interface InfinitePostsData {
  pages: Array<{
    posts: PostWithDetails[];
    total: number;
  }>;
  pageParams: number[];
}

export function useInfinitePosts({
  groupId,
  searchQuery,
  tagId,
  categoryId,
  onlyForum = false,
  enabled = true,
  limit = 20,
}: UseInfinitePostsOptions) {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "infinite-posts",
      { groupId, searchQuery, tagId, categoryId, onlyForum },
    ],
    queryFn: ({ pageParam = 0 }) =>
      postService.getPosts({
        groupId,
        offset: pageParam,
        limit,
        searchQuery,
        tagId: tagId ?? undefined,
        categoryId: categoryId ?? undefined,
        onlyForum,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (total, page) => total + page.posts.length,
        0
      );
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation to create post
  const createPostMutation = useMutation({
    mutationFn: (postData: {
      groupId?: string;
      content: string;
      title?: string;
      categoryId?: string;
      tags?: string[];
    }) => postService.createPost(postData),
    onSuccess: (newPost) => {
      // Add new post to the first page
      queryClient.setQueryData(
        [
          "infinite-posts",
          { groupId, searchQuery, tagId, categoryId, onlyForum },
        ],
        (oldData: InfinitePostsData | undefined) => {
          if (!oldData?.pages?.length) {
            return {
              pages: [
                {
                  posts: [newPost],
                  total: 1,
                },
              ],
              pageParams: [0],
            };
          }

          // Refetch to ensure we have the complete post data
          refetch();
          return oldData;
        }
      );
    },
  });

  // Mutation para toggle like
  const toggleLikeMutation = useMutation({
    mutationFn: (postId: string) => postService.toggleLike(postId),
    onMutate: async (postId: string) => {
      // Optimistic update
      const queryKey = [
        "infinite-posts",
        { groupId, searchQuery, tagId, categoryId, onlyForum },
      ];

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(
        queryKey,
        (oldData: InfinitePostsData | undefined) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    is_liked: !post.is_liked,
                    likes_count: post.is_liked
                      ? post.likes_count - 1
                      : post.likes_count + 1,
                  }
                : post
            ),
          }));

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );

      return { previousData };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          [
            "infinite-posts",
            { groupId, searchQuery, tagId, categoryId, onlyForum },
          ],
          context.previousData
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: [
          "infinite-posts",
          { groupId, searchQuery, tagId, categoryId, onlyForum },
        ],
      });
    },
  });

  // Fetch tags and categories
  const tags = useQuery({
    queryKey: ["tags"],
    queryFn: () => postService.getTags(),
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => postService.getCategories(),
  });

  // Derived data
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];
  const totalPosts = data?.pages[0]?.total ?? 0;
  const isLoading = status === "pending";
  const isError = status === "error";

  return {
    posts,
    totalPosts,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
    refetch,
    createPost: createPostMutation.mutateAsync,
    isCreatingPost: createPostMutation.isPending,
    toggleLike: toggleLikeMutation.mutateAsync,
    isTogglingLike: toggleLikeMutation.isPending,
    tags: tags.data ?? [],
    categories: categories.data ?? [],
    isLoadingTags: tags.isLoading,
    isLoadingCategories: categories.isLoading,
  };
}
