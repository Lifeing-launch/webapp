import { BaseForumService } from "./base-forum-service";
import { Comment, CommentWithDetails, StatusEnum } from "@/typing/forum";
import {
  subscribeToPostComments,
  type RealtimeSubscription,
} from "@/utils/supabase/realtime-config";

/**
 * Serviço para operações com comentários
 * Inclui funcionalidades de CRUD e realtime para comentários
 */
export class CommentService extends BaseForumService {
  /**
   * Busca comentários de um post
   */
  async getComments(postId: string): Promise<CommentWithDetails[]> {
    try {
      const { data, error } = await this.supabase
        .from("comments")
        .select(
          `
          *,
          author_profile:anonymous_profiles!comments_author_anon_id_fkey(
            id, nickname, created_at
          )
        `
        )
        .eq("post_id", postId)
        .eq("status", "approved")
        .order("created_at", { ascending: true });

      if (error) {
        this.handleError(error, "fetch comments");
      }

      return data || [];
    } catch (error) {
      this.handleError(error, "fetch comments");
    }
  }

  /**
   * Busca comentários aninhados (com replies)
   */
  async getNestedComments(postId: string): Promise<CommentWithDetails[]> {
    try {
      const comments = await this.getComments(postId);

      // Organiza comentários em estrutura aninhada
      const commentMap = new Map<string, CommentWithDetails>();
      const rootComments: CommentWithDetails[] = [];

      // Primeiro, cria o mapa de todos os comentários
      comments.forEach((comment) => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Segundo, organiza a hierarquia
      comments.forEach((comment) => {
        const commentWithReplies = commentMap.get(comment.id)!;

        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(commentWithReplies);
          }
        } else {
          rootComments.push(commentWithReplies);
        }
      });

      return rootComments;
    } catch (error) {
      this.handleError(error, "fetch nested comments");
    }
  }

  /**
   * Cria um novo comentário
   */
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
          status: "approved" as StatusEnum, // Comments aprovados por padrão
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, "create comment");
      }

      return data;
    } catch (error) {
      this.handleError(error, "create comment");
    }
  }

  /**
   * Atualiza um comentário (apenas o autor pode atualizar)
   */
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

  /**
   * Deleta um comentário (apenas o autor pode deletar)
   */
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

  /**
   * Conta o número de comentários de um post
   */
  async getCommentsCount(postId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .eq("status", "approved");

      if (error) {
        this.handleError(error, "count comments");
      }

      return count || 0;
    } catch (error) {
      this.handleError(error, "count comments");
    }
  }

  /**
   * Busca comentário por ID
   */
  async getCommentById(commentId: string): Promise<CommentWithDetails | null> {
    try {
      const { data, error } = await this.supabase
        .from("comments")
        .select(
          `
          *,
          author_profile:anonymous_profiles!comments_author_anon_id_fkey(
            id, nickname, created_at
          )
        `
        )
        .eq("id", commentId)
        .eq("status", "approved")
        .single();

      if (error && error.code !== "PGRST116") {
        this.handleError(error, "fetch comment by ID");
      }

      return data;
    } catch (error) {
      this.handleError(error, "fetch comment by ID");
    }
  }

  // ===================================================================
  // REALTIME METHODS
  // ===================================================================

  /**
   * Subscribe para novos comentários em um post
   */
  subscribeToPostComments(
    postId: string,
    onNewComment: (comment: Record<string, unknown>) => void,
    onCommentUpdate?: (comment: Record<string, unknown>) => void
  ): RealtimeSubscription {
    return subscribeToPostComments(postId, onNewComment, onCommentUpdate);
  }
}

// Instância singleton do serviço
export const commentService = new CommentService();
