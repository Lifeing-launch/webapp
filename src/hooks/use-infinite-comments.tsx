import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { commentService, profileService } from "@/services/forum";
import { Comment } from "@/typing/forum";

interface UseInfiniteCommentsOptions {
  postId: string;
  enabled?: boolean;
  limit?: number;
}

interface InfiniteCommentsData {
  pages: Array<{
    comments: Comment[];
    total: number;
  }>;
  pageParams: number[];
}

export function useInfiniteComments({
  postId,
  enabled = true,
  limit = 15,
}: UseInfiniteCommentsOptions) {
  const queryClient = useQueryClient();

  // Use cached profile from ProfileService to avoid redundant calls
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["current-profile-for-comments"],
    queryFn: () => profileService.getCurrentProfile(),
    staleTime: 2 * 60 * 1000, // 2 minutes - matches ProfileService cache
    enabled: enabled && !!postId,
  });

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
    queryKey: ["comments", postId],
    queryFn: ({ pageParam = 0 }) =>
      commentService.getComments(postId, pageParam, limit, profile?.id || ""),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (total, page) => total + page.comments.length,
        0
      );
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    enabled: enabled && !!postId && !profileLoading,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation to create comment
  const createCommentMutation = useMutation({
    mutationFn: (commentData: { content: string; parentCommentId?: string }) =>
      commentService.createComment({
        postId,
        content: commentData.content,
        parentCommentId: commentData.parentCommentId,
      }),
    onSuccess: (newComment) => {
      // Add new comment to the first page
      queryClient.setQueryData(
        ["comments", postId],
        (oldData: InfiniteCommentsData | undefined) => {
          if (!oldData?.pages?.length) {
            return {
              pages: [
                {
                  comments: [newComment],
                  total: 1,
                },
              ],
              pageParams: [0],
            };
          }

          const newPages = [...oldData.pages];
          newPages[0] = {
            ...newPages[0],
            comments: [newComment, ...newPages[0].comments],
            total: newPages[0].total + 1,
          };

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
    },
  });

  // Derived data
  const comments = data?.pages.flatMap((page) => page.comments) ?? [];
  const totalComments = data?.pages[0]?.total ?? 0;
  const isLoading = status === "pending" || profileLoading;
  const isError = status === "error";

  return {
    comments,
    totalComments,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
    refetch,
    createComment: createCommentMutation.mutateAsync,
    isCreatingComment: createCommentMutation.isPending,
    profile,
  };
}
