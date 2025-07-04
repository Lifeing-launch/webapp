import React, { useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { ForumComment } from "@/typing/forum";
import { CommentCard } from "./comment-card";
import { CommentForm } from "./comment-form";

const COMMENTS_PER_PAGE = 10;

// Mock comments data for simulation
const mockComments: ForumComment[] = Array.from({ length: 25 }, (_, index) => ({
  id: String(index + 1),
  post_id: String(index + 1),
  author_anon_id: `anon${index + 1}`,
  status: "approved",
  created_at: new Date(Date.now() - index * 60000).toISOString(),
  content: `This is comment #${index + 1}. Great post! Really helpful information.`,
}));

export interface ICommentSection {
  postId: string;
}

export function CommentSection({ postId }: ICommentSection) {
  const [comments, setComments] = useState<ForumComment[]>(mockComments);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [displayedComments, setDisplayedComments] = useState(COMMENTS_PER_PAGE);
  const [allComments] = useState<ForumComment[]>(mockComments);

  const loadMoreComments = useCallback(async () => {
    if (isLoadingComments) return;

    setIsLoadingComments(true);

    // Simulate API call delay
    setTimeout(() => {
      const newDisplayCount = Math.min(
        displayedComments + COMMENTS_PER_PAGE,
        allComments.length
      );
      setDisplayedComments(newDisplayCount);
      setIsLoadingComments(false);
    }, 800);
  }, [isLoadingComments, displayedComments, allComments.length]);

  const handleAddComment = useCallback(
    (commentText: string) => {
      const newComment: ForumComment = {
        id: String(Date.now()),
        post_id: postId,
        author_anon_id: "currentuser",
        status: "approved",
        created_at: new Date().toISOString(),
        content: commentText,
      };

      setComments((prev) => [newComment, ...prev]);
    },
    [postId]
  );

  const visibleComments = [
    ...comments,
    ...allComments.slice(0, displayedComments),
  ];
  const hasMoreComments = displayedComments < allComments.length;

  return (
    <div className="mt-6 space-y-3 border-t border-gray-200">
      <CommentForm onSubmit={handleAddComment} postId={postId} />
      <h3 className="text-xs font-semibold text-zinc-900">
        Comments ({visibleComments.length})
      </h3>
      <div className="space-y-3">
        {visibleComments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}

        {hasMoreComments && (
          <div className="flex justify-center pt-4 pb-2">
            <button
              onClick={loadMoreComments}
              disabled={isLoadingComments}
              className="group flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingComments ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Loading more comments...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform duration-200" />
                  <span className="border-b border-dotted border-zinc-400 group-hover:border-zinc-600 transition-colors">
                    Load more comments ({allComments.length - displayedComments}{" "}
                    remaining)
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
