import React, { useState, useCallback, useEffect } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Comment } from "@/typing/forum";
import { CommentCard } from "./comment-card";
import { CommentForm } from "./comment-form";
import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/forum";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

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
  const [offset, setOffset] = useState(0);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId, offset],
    queryFn: () => postService.getComments(postId, offset),
    enabled: !!postId && opened,
  });

  useEffect(() => {
    if (data) {
      if (offset === 0) {
        setAllComments(data.comments);
      } else {
        setAllComments((prev) => [...prev, ...data.comments]);
      }
    }
  }, [data, offset]);

  const loadMoreComments = useCallback(async () => {
    if (isLoadingMore || !data) return;

    setIsLoadingMore(true);

    setOffset((prev) => prev + 15);

    setTimeout(() => {
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, data]);

  const handleAddComment = useCallback(
    (commentText: string) => {
      const newComment: Comment = {
        id: String(Date.now()),
        post_id: postId,
        author_anon_id: "currentuser",
        status: "approved",
        created_at: new Date().toISOString(),
        content: commentText,
      };

      setLocalComments((prev) => [newComment, ...prev]);
    },
    [postId]
  );

  const visibleComments = [...localComments, ...allComments];
  const totalComments = (data?.total || 0) + localComments.length;
  const hasMoreComments = data ? allComments.length < data.total : false;

  return (
    <div className="mt-6 space-y-3 border-t border-gray-200">
      <CommentForm onSubmit={handleAddComment} postId={postId} />
      <h3 className="text-xs font-semibold text-zinc-900">
        Comments ({totalComments})
      </h3>
      <div className="space-y-3">
        {isLoading && visibleComments.length === 0 ? (
          <div className="space-y-0">
            {Array.from({ length: 1 }).map((_, index) => (
              <CommentSkeleton key={index} />
            ))}
          </div>
        ) : visibleComments.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="h-12 w-12" />}
            title="No comments yet"
            description="Be the first to share your thoughts on this post"
            variant="subtle"
            size="sm"
          />
        ) : (
          visibleComments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}

        {hasMoreComments && (
          <div className="flex justify-center pt-4 pb-2">
            <button
              onClick={loadMoreComments}
              disabled={isLoadingMore || isLoading}
              className="group flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Loading more comments...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform duration-200" />
                  <span className="border-b border-dotted border-zinc-400 group-hover:border-zinc-600 transition-colors">
                    Load more comments (
                    {data && data.total - allComments.length} remaining)
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
