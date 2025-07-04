import React from "react";
import { ForumPostCard } from "./forum-post-card";
import { useForumPosts, UseForumPostsOptions } from "@/hooks/use-forum";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, MessageSquare } from "lucide-react";
import { postService } from "@/services/forum";

export interface IForumPostList {
  filters: UseForumPostsOptions;
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
 * Error state component for forum sections
 */
function ForumErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Empty state component for the entire forum
 */
function ForumEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 w-full flex-1">
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
 * Display list of forum posts with interactive features
 */
export function ForumPostList({ filters }: IForumPostList) {
  const {
    posts: { data: posts, isLoading, error, isFetched },
  } = useForumPosts(filters);

  if (isLoading || !isFetched) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <ForumPostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ForumErrorState message="Error loading posts." />;
  }

  if (
    posts?.length === 0 &&
    !filters.searchQuery &&
    !filters.tagId &&
    !filters.categoryId
  ) {
    return <ForumEmptyState />;
  }

  return (
    <div className="h-full overflow-y-auto">
      {posts?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground text-sm">
            {filters.searchQuery || filters.tagId || filters.categoryId
              ? "No posts found matching your criteria."
              : "No posts available."}
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {posts?.map((post) => (
            <ForumPostCard
              key={post.id}
              post={post}
              onLike={() => postService.toggleLike(post.id)}
              onAddComment={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ForumPostList;
