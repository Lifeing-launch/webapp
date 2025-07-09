import { BaseForumService } from "./base-forum-service";
import { Comment, CommentWithDetails, StatusEnum } from "@/typing/forum";

export class CommentService extends BaseForumService {
  async getComments(
    postId: string,
    offset: number = 0,
    limit: number = 100,
    currentUserId?: string
  ): Promise<{ comments: CommentWithDetails[]; total: number }> {
    let query = this.supabase
      .from("comments")
      .select(
        `
        *,
        author_profile:anonymous_profiles!comments_author_anon_id_fkey(
          id, nickname, created_at
        )
      `,
        { count: "exact" }
      )
      .eq("post_id", postId);

    if (currentUserId) {
      query = query.or(`status.eq.approved,author_anon_id.eq.${currentUserId}`);
    } else {
      query = query.eq("status", "approved");
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      this.handleError(error, "fetch comments");
    }

    return {
      comments: data || [],
      total: count || 0,
    };
  }

  async createComment(commentData: {
    postId: string;
    content: string;
    parentCommentId?: string;
  }): Promise<Comment> {
    try {
      const { postId, content, parentCommentId } = commentData;
      const profile = await this.requireProfile();

      const { data, error } = await this.supabase
        .from("comments")
        .insert({
          post_id: postId,
          author_anon_id: profile.id,
          content: content.trim(),
          parent_comment_id: parentCommentId || null,
          status: "pending" as StatusEnum,
        })
        .select(
          `*, author_profile:anonymous_profiles!comments_author_anon_id_fkey(
            id, nickname, created_at
          )`
        )
        .single();

      if (error) {
        this.handleError(error, "create comment");
      }

      this.moderateComment(data.id);

      return data;
    } catch (error) {
      this.handleError(error, "create comment");
    }
  }

  /**
   * Chama o endpoint interno de moderação
   * @private
   */
  private async moderateComment(commentId: string): Promise<void> {
    try {
      const response = await fetch("/api/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_id: commentId,
          resource_type: "comment",
        }),
      });

      if (!response.ok) {
        console.error(
          "Moderation API error:",
          response.status,
          response.statusText
        );
        // Don't throw error to prevent blocking comment creation
        return;
      }

      const data = await response.json();
      if (data?.success) {
        console.log(`Comment ${commentId} moderated successfully`);
      }
    } catch (error) {
      console.error("Failed to moderate comment:", commentId, error);
      // Don't throw error to prevent blocking comment creation
    }
  }

  async updateComment(commentId: string, content: string): Promise<Comment> {
    try {
      const profile = await this.requireProfile();

      const { data, error } = await this.supabase
        .from("comments")
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .eq("author_anon_id", profile.id)
        .select()
        .single();

      if (error) {
        this.handleError(error, "update comment");
      }

      return data;
    } catch (error) {
      this.handleError(error, "update comment");
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      const profile = await this.requireProfile();

      const { error } = await this.supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("author_anon_id", profile.id);

      if (error) {
        this.handleError(error, "delete comment");
      }
    } catch (error) {
      this.handleError(error, "delete comment");
    }
  }
}

export const commentService = new CommentService();
