import React, { useState, useCallback } from "react";

export interface ICommentForm {
  onSubmit: (commentText: string) => void;
  postId: string;
}

export function CommentForm({ onSubmit, postId }: ICommentForm) {
  const [commentText, setCommentText] = useState("");

  console.log(postId);

  const handleAddComment = useCallback(() => {
    if (!commentText.trim()) return;
    onSubmit(commentText);
    setCommentText("");
  }, [commentText, onSubmit]);

  return (
    <div className="flex gap-3">
      <div className="flex-1 mt-3">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add your comment"
          className="w-full min-h-20 p-3 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
      </div>
    </div>
  );
}

export default CommentForm;
