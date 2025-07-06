import React, { useState, useCallback, useMemo } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForumPostList } from "./forum-post-list";
import { useForumPosts, UseForumPostsOptions } from "@/hooks/use-forum";
import { postService } from "@/services/forum";
import { Textarea } from "@/components/ui/textarea";

export interface IGroupThreads {
  groupId: string;
  searchQuery: string;
}

export function GroupThreads({ groupId, searchQuery }: IGroupThreads) {
  const [newPostText, setNewPostText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create filters for this specific group
  const filters = useMemo<UseForumPostsOptions>(
    () => ({
      groupId,
      searchQuery: searchQuery || undefined,
      limit: 100,
    }),
    [groupId, searchQuery]
  );

  const {
    posts: { refetch: refetchPosts },
  } = useForumPosts(filters);

  const handleSendPost = useCallback(async () => {
    if (!newPostText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await postService.createPost({
        content: newPostText.trim(),
        groupId: groupId,
      });

      setNewPostText("");
      // Refetch posts to show the new one
      await refetchPosts();
    } catch (error) {
      console.error("Failed to create post:", error);
      // You could add toast notification here
    } finally {
      setIsSubmitting(false);
    }
  }, [newPostText, isSubmitting, groupId, refetchPosts]);

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
          <ForumPostList filters={filters}  />
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
          <div className="flex justify-end">
            <Button
              size="sm"
              className="gap-2"
              onClick={handleSendPost}
              disabled={!newPostText.trim() || isSubmitting}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Sending..." : "Send"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
