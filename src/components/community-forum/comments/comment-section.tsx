import React, { useCallback } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { CommentCard } from "./comment-card";
import { CommentForm } from "./comment-form";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useInfiniteComments } from "@/hooks/use-infinite-comments";

function CommentSkeleton() {
  return (
    <div className="flex gap-4 p-3 border-b border-gray-100 last:border-b-0">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export interface ICommentSection {
  postId: string;
  opened: boolean;
}

export function CommentSection({ postId, opened }: ICommentSection) {
  const {
    comments,
    totalComments,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    createComment,
  } = useInfiniteComments({
    postId,
    enabled: opened,
  });

  const handleAddComment = useCallback(
    async (commentText: string) => {
      try {
        await createComment({
          content: commentText,
        });
      } catch (error) {
        console.error("Failed to create comment:", error);
        // Aqui você pode adicionar uma notificação de erro para o usuário
      }
    },
    [createComment]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="mt-6 space-y-3 border-t border-gray-200">
      <CommentForm onSubmit={handleAddComment} postId={postId} />
      <h3 className="text-xs font-semibold text-zinc-900">
        Comments ({totalComments})
      </h3>
      <div className="space-y-3">
        {isLoading && comments.length === 0 ? (
          <div className="space-y-0">
            {Array.from({ length: 3 }).map((_, index) => (
              <CommentSkeleton key={index} />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="h-12 w-12" />}
            title="No comments yet"
            description="Be the first to share your thoughts on this post"
            variant="subtle"
            size="sm"
          />
        ) : (
          comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}

        {hasNextPage && (
          <div className="flex justify-center pt-4 pb-2">
            <button
              onClick={handleLoadMore}
              disabled={isFetchingNextPage}
              className="group flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetchingNextPage ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Loading more comments...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform duration-200" />
                  <span className="border-b border-dotted border-zinc-400 group-hover:border-zinc-600 transition-colors">
                    Load more comments
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentSection;
