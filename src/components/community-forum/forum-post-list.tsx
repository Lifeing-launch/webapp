import React, { useState } from "react";
import { ForumPostCard } from "./forum-post-card";
import { PostWithDetails } from "@/typing/forum";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ChevronDown, ArrowLeft } from "lucide-react";
import { postService } from "@/services/forum";
import { CommentSection } from "./comments/comment-section";
import { Button } from "@/components/ui/button";

export interface IForumPostList {
  posts: PostWithDetails[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
}

/**
 * Skeleton component for forum posts
 */
function ForumPostSkeleton() {
  return (
    <div className="border-b border-gray-200 py-6 px-2">
      <div className="flex gap-4">
        {/* Avatar skeleton */}
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

        {/* Content skeleton */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Header skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Actions skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component for the entire forum
 */
function ForumEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4 w-full">
      <MessageSquare className="h-16 w-16 text-muted-foreground mb-6" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Welcome to the Community Forum
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        This is where community members share thoughts, ask questions, and
        connect with each other. Be the first to start a conversation!
      </p>
    </div>
  );
}

/**
 * Isolated post view with comments
 */
function PostDetailView({
  post,
  onBack,
}: {
  post: PostWithDetails;
  onBack: () => void;
}) {
  return (
    <div className="h-full overflow-y-auto">
      {/* Header with back button */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to posts
        </Button>
      </div>

      {/* Post content */}
      <div className="p-4">
        <ForumPostCard
          post={post}
          onLike={() => postService.toggleLike(post.id)}
          onAddComment={() => {}}
          isDetailView={true}
        />
        {/* Comments section */}
        <div className="mt-6 pl-4 border-l-2 border-gray-100">
          <CommentSection postId={post.id} opened={true} />
        </div>
      </div>
    </div>
  );
}

/**
 * Display list of forum posts with infinite scroll
 */
export function ForumPostList({
  posts,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
}: IForumPostList) {
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(
    null
  );

  const handlePostSelect = (post: PostWithDetails) => {
    setSelectedPost(post);
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  // Show post detail view if a post is selected
  if (selectedPost) {
    return <PostDetailView post={selectedPost} onBack={handleBackToList} />;
  }

  if (isLoading && posts.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <ForumPostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-full overflow-y-auto flex items-center justify-center">
        <ForumEmptyState />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-0">
        {posts.map((post) => (
          <ForumPostCard
            key={post.id}
            post={post}
            onLike={() => postService.toggleLike(post.id)}
            onAddComment={() => {}}
            onCommentClick={() => handlePostSelect(post)}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center py-6">
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Loading more posts...</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform duration-200" />
                <span>Load more posts</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default ForumPostList;
