import { BaseForumService } from "./base-forum-service";
import { Comment, CommentWithDetails, StatusEnum } from "@/typing/forum";

export class CommentService extends BaseForumService {
  async getComments(
    postId: string,
    offset: number = 0,
    limit: number = 15,
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
        .select()
        .single();

      if (error) {
        this.handleError(error, "create comment");
      }

      // Chamar moderação assíncrona - não bloqueia a criação do comentário
      this.moderateComment(data.id).catch((error) => {
        console.error("Moderation failed for comment:", data.id, error);
        // Falha silenciosa - o comentário permanece com status "pending"
      });

      return data;
    } catch (error) {
      this.handleError(error, "create comment");
    }
  }

  /**
   * Chama a edge function de moderação
   * @private
   */
  private async moderateComment(commentId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.client.functions.invoke(
        "moderate-resource",
        {
          body: {
            resource_id: commentId,
            resource_type: "comment",
          },
        }
      );

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      if (data?.success) {
        console.log(
          `Comment ${commentId} moderated: ${data.status} - ${data.reason}`
        );
      }
    } catch (error) {
      console.error("Failed to moderate comment:", commentId, error);
      throw error;
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
