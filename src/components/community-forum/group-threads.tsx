import React, { useState, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForumPost } from "@/typing/forum";
import { ForumPostCard } from "./forum-post-card";

/**
 * Group Threads Component - Shows threads/posts within a specific group
 * Reuses ForumPostCard for consistency with forum-post-list
 */
export function GroupThreads() {
  // Mock threads data converted to ForumPost format
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: "thread-1",
      author_anon_id: "anon-1",
      content:
        "Hey everyone! I just started exploring Lifeing Wellness and I'm truly amazed at how simple it is to enhance my well-being. Big thanks to the Lifeing team for creating such an impactful platform!",
      status: "approved",
      created_at: new Date(Date.now() - 720000).toISOString(), // 12 min ago
      author: {
        id: "anon-1",
        user_id: "user-1",
        nickname: "@heidiblair",
        created_at: new Date().toISOString(),
      },
      category: {
        id: "group-general",
        name: "Group Discussion",
      },
      likesCount: 10,
      commentsCount: 2,
      isLiked: false,
    },
    {
      id: "thread-2",
      author_anon_id: "anon-2",
      content:
        "I recently joined Lifeing Wellness, and the resources available are top-notch! Looking forward to a healthier lifestyle with this amazing community.",
      status: "approved",
      created_at: new Date(Date.now() - 1200000).toISOString(), // 20 min ago
      author: {
        id: "anon-2",
        user_id: "user-2",
        nickname: "@jameswong",
        created_at: new Date().toISOString(),
      },
      category: {
        id: "group-general",
        name: "Group Discussion",
      },
      likesCount: 16,
      commentsCount: 5,
      isLiked: false,
    },
    {
      id: "thread-3",
      author_anon_id: "anon-3",
      content:
        "Just completed my first week using Lifeing Wellness! The workout plans are really engaging, and I can already feel the difference. Highly recommend it!",
      status: "approved",
      created_at: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      author: {
        id: "anon-3",
        user_id: "user-3",
        nickname: "@sarahjones",
        created_at: new Date().toISOString(),
      },
      category: {
        id: "group-general",
        name: "Group Discussion",
      },
      tags: [
        { id: "tag-1", name: "#WorkoutPlan" },
        { id: "tag-2", name: "#Progress" },
      ],
      likesCount: 8,
      commentsCount: 3,
      isLiked: false,
    },
    {
      id: "thread-4",
      author_anon_id: "anon-4",
      content:
        "Lifeing Wellness has transformed my approach to nutrition! The meal plans are easy to follow and the results speak for themselves.",
      status: "approved",
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      author: {
        id: "anon-4",
        user_id: "user-4",
        nickname: "@marksmith",
        created_at: new Date().toISOString(),
      },
      category: {
        id: "group-general",
        name: "Group Discussion",
      },
      tags: [{ id: "tag-3", name: "#Nutrition" }],
      likesCount: 12,
      commentsCount: 4,
      isLiked: false,
    },
  ]);

  const [newPostText, setNewPostText] = useState("");

  const handleLike = useCallback((postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          return {
            ...post,
            isLiked: newIsLiked,
            likesCount: newIsLiked
              ? (post.likesCount || 0) + 1
              : (post.likesCount || 0) - 1,
          };
        }
        return post;
      })
    );
  }, []);

  const handleAddComment = useCallback((postId: string, comment: string) => {
    console.log(`Adding comment to post ${postId}:`, comment);
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
          : post
      )
    );
  }, []);

  const handleSendPost = () => {
    if (newPostText.trim()) {
      const newPost: ForumPost = {
        id: `thread-${Date.now()}`,
        author_anon_id: "current-user",
        content: newPostText,
        status: "approved",
        created_at: new Date().toISOString(),
        author: {
          id: "current-user",
          user_id: "current-user-id",
          nickname: "@you",
          created_at: new Date().toISOString(),
        },
        category: {
          id: "group-general",
          name: "Group Discussion",
        },
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
      };

      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setNewPostText("");
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Posts List - Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground text-sm">
              No posts in this group yet. Be the first to share something!
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onAddComment={handleAddComment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Share a thought - Fixed Bottom */}
      <div className="border-t border-border px-4 py-3">
        <div className="space-y-3">
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Share a thought"
            className="w-full min-h-20 p-3 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendPost();
              }
            }}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              className="gap-2"
              onClick={handleSendPost}
              disabled={!newPostText.trim()}
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
