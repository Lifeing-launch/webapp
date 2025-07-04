import { forumClient } from "./forum";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

/**
 * Configurações de Realtime para o schema forum
 * Baseado na documentação do Supabase v2
 */

/**
 * Habilita realtime para as tabelas do fórum
 * Execute apenas uma vez no banco de dados
 */
export const enableRealtimeForForumTables = async () => {
  const queries = [
    "ALTER PUBLICATION supabase_realtime ADD TABLE forum.posts;",
    "ALTER PUBLICATION supabase_realtime ADD TABLE forum.comments;",
    "ALTER PUBLICATION supabase_realtime ADD TABLE forum.messages;",
    "ALTER PUBLICATION supabase_realtime ADD TABLE forum.likes;",
    "ALTER PUBLICATION supabase_realtime ADD TABLE forum.group_members;",
  ];

  console.log("Execute estas queries no SQL Editor do Supabase Dashboard:");
  queries.forEach((query, index) => {
    console.log(`${index + 1}. ${query}`);
  });

  return queries;
};

/**
 * Configurações de canais realtime padrão
 */
export const REALTIME_CHANNELS = {
  /**
   * Canal para posts de uma thread específica
   */
  postsInThread: (threadId: string) => `posts:thread_${threadId}`,

  /**
   * Canal para comentários de um post específico
   */
  commentsInPost: (postId: string) => `comments:post_${postId}`,

  /**
   * Canal para mensagens diretas de um usuário
   */
  userMessages: (profileId: string) => `messages:${profileId}`,

  /**
   * Canal para conversas entre dois usuários
   */
  conversation: (profileId1: string, profileId2: string) => {
    const sorted = [profileId1, profileId2].sort();
    return `conversation:${sorted[0]}:${sorted[1]}`;
  },

  /**
   * Canal para membros de um grupo
   */
  groupMembers: (groupId: string) => `group_members:${groupId}`,

  /**
   * Canal para likes de posts
   */
  postLikes: (postId: string) => `likes:post_${postId}`,
};

/**
 * Tipos para eventos realtime
 */
export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export interface RealtimeFilter {
  event: RealtimeEvent;
  schema: string;
  table: string;
  filter?: string;
}

export interface RealtimeLikePayload {
  isLiked: boolean;
  count: number;
  like: Record<string, unknown>;
}

/**
 * Configurações de filtros para eventos realtime
 */
export const REALTIME_FILTERS = {
  /**
   * Posts de uma thread específica
   */
  postsInThread: (threadId: string): RealtimeFilter => ({
    event: "INSERT",
    schema: "forum",
    table: "posts",
    filter: `thread_id=eq.${threadId}`,
  }),

  /**
   * Comentários de um post específico
   */
  commentsInPost: (postId: string): RealtimeFilter => ({
    event: "INSERT",
    schema: "forum",
    table: "comments",
    filter: `post_id=eq.${postId}`,
  }),

  /**
   * Mensagens recebidas por um usuário
   */
  messagesReceived: (profileId: string): RealtimeFilter => ({
    event: "INSERT",
    schema: "forum",
    table: "messages",
    filter: `receiver_anon_id=eq.${profileId}`,
  }),

  /**
   * Likes em um post específico
   */
  likesInPost: (postId: string): RealtimeFilter => ({
    event: "*",
    schema: "forum",
    table: "likes",
    filter: `post_id=eq.${postId}`,
  }),

  /**
   * Novos membros em um grupo
   */
  newGroupMembers: (groupId: string): RealtimeFilter => ({
    event: "INSERT",
    schema: "forum",
    table: "group_members",
    filter: `group_id=eq.${groupId}`,
  }),
};

/**
 * Interface para subscription realtime
 */
export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

/**
 * Utilitário para criar subscription de realtime com configuração padrão
 */
export const createRealtimeSubscription = (
  channelName: string,
  filter: RealtimeFilter,
  callback: (
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>
  ) => void
): RealtimeSubscription => {
  const channel = forumClient.channel(channelName);

  channel.on("postgres_changes" as never, filter, callback);

  channel.subscribe();

  return {
    channel,
    unsubscribe: () => forumClient.removeChannel(channel),
  };
};

/**
 * Subscription para posts em tempo real
 */
export const subscribeToThreadPosts = (
  threadId: string,
  onNewPost: (post: Record<string, unknown>) => void
): RealtimeSubscription => {
  return createRealtimeSubscription(
    REALTIME_CHANNELS.postsInThread(threadId),
    REALTIME_FILTERS.postsInThread(threadId),
    (payload) => {
      if (payload.eventType === "INSERT") {
        onNewPost(payload.new);
      }
    }
  );
};

/**
 * Subscription para comentários em tempo real
 */
export const subscribeToPostComments = (
  postId: string,
  onNewComment: (comment: Record<string, unknown>) => void,
  onCommentUpdate?: (comment: Record<string, unknown>) => void
): RealtimeSubscription => {
  return createRealtimeSubscription(
    REALTIME_CHANNELS.commentsInPost(postId),
    REALTIME_FILTERS.commentsInPost(postId),
    (payload) => {
      if (payload.eventType === "INSERT") {
        onNewComment(payload.new);
      } else if (payload.eventType === "UPDATE" && onCommentUpdate) {
        onCommentUpdate(payload.new);
      }
    }
  );
};

/**
 * Subscription para likes em tempo real
 */
export const subscribeToPostLikes = (
  postId: string,
  onLikeChange: (payload: RealtimeLikePayload) => void
): RealtimeSubscription => {
  return createRealtimeSubscription(
    REALTIME_CHANNELS.postLikes(postId),
    REALTIME_FILTERS.likesInPost(postId),
    (payload) => {
      const isLiked = payload.eventType === "INSERT";
      onLikeChange({
        isLiked,
        count: isLiked ? 1 : -1, // Para incrementar/decrementar localmente
        like: payload.new || payload.old,
      });
    }
  );
};

/**
 * Subscription para mensagens diretas
 */
export const subscribeToUserMessages = (
  profileId: string,
  onNewMessage: (message: Record<string, unknown>) => void
): RealtimeSubscription => {
  return createRealtimeSubscription(
    REALTIME_CHANNELS.userMessages(profileId),
    REALTIME_FILTERS.messagesReceived(profileId),
    (payload) => {
      if (payload.eventType === "INSERT") {
        onNewMessage(payload.new);
      }
    }
  );
};

/**
 * Subscription para conversas (mensagens bidirecionais)
 */
export const subscribeToConversation = (
  profileId1: string,
  profileId2: string,
  onNewMessage: (message: Record<string, unknown>) => void
): RealtimeSubscription => {
  const channelName = REALTIME_CHANNELS.conversation(profileId1, profileId2);

  const channel = forumClient.channel(channelName);

  // Escutar mensagens de profileId1 para profileId2
  channel.on(
    "postgres_changes" as never,
    {
      event: "INSERT",
      schema: "forum",
      table: "messages",
      filter: `and(sender_anon_id.eq.${profileId1},receiver_anon_id.eq.${profileId2})`,
    },
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      onNewMessage(payload.new);
    }
  );

  // Escutar mensagens de profileId2 para profileId1
  channel.on(
    "postgres_changes" as never,
    {
      event: "INSERT",
      schema: "forum",
      table: "messages",
      filter: `and(sender_anon_id.eq.${profileId2},receiver_anon_id.eq.${profileId1})`,
    },
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      onNewMessage(payload.new);
    }
  );

  channel.subscribe();

  return {
    channel,
    unsubscribe: () => forumClient.removeChannel(channel),
  };
};
