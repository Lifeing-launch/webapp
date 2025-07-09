import React, { useState, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForumPostList } from "./forum-post-list";
import { useInfinitePosts } from "@/hooks/use-infinite-posts";
import { Textarea } from "@/components/ui/textarea";

export interface IGroupThreads {
  groupId: string;
  searchQuery: string;
}

export function GroupThreads({ groupId, searchQuery }: IGroupThreads) {
  const [newPostText, setNewPostText] = useState("");

  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    createPost,
    isCreatingPost,
  } = useInfinitePosts({
    groupId,
    searchQuery: searchQuery || undefined,
    onlyForum: false,
  });

  const handleSendPost = useCallback(async () => {
    if (!newPostText.trim() || isCreatingPost) return;

    try {
      await createPost({
        content: newPostText.trim(),
        groupId: groupId,
      });

      setNewPostText("");
    } catch (error) {
      console.error("Failed to create post:", error);
      // You could add toast notification here
    }
  }, [newPostText, isCreatingPost, groupId, createPost]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendPost();
      }
    },
    [handleSendPost]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Posts List - Scrollable Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 pb-0">
          <ForumPostList
            posts={posts}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onLoadMore={fetchNextPage}
          />
        </div>
      </div>

      {/* Share a thought - Fixed Bottom */}
      <div className="border-t border-border px-4 py-3">
        <div className="space-y-3">
          <Textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Share a thought with the group..."
            className="min-h-20 resize-none"
            rows={3}
            onKeyDown={handleKeyDown}
          />
          <div className="flex justify-start">
            <Button
              size="sm"
              className="gap-2"
              onClick={handleSendPost}
              disabled={!newPostText.trim() || isCreatingPost}
            >
              <Send className="w-4 h-4" />
              <span>{isCreatingPost ? "Sending..." : "Send"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
