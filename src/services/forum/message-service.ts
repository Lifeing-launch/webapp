import { BaseForumService } from "./base-forum-service";
import { Message, MessageWithDetails, StatusEnum } from "@/typing/forum";

/**
 * Serviço para operações com mensagens diretas (DMs)
 * Inclui funcionalidades de CRUD para mensagens
 */
export class MessageService extends BaseForumService {
  /**
   * Busca mensagens de uma conversa entre dois usuários
   */
  async getMessages(contactProfileId: string): Promise<MessageWithDetails[]> {
    try {
      const profile = await this.requireProfile();

      const { data, error } = await this.supabase
        .from("messages")
        .select(
          `
          *,
          sender_profile:anonymous_profiles!messages_sender_anon_id_fkey(
            id, nickname, created_at
          ),
          receiver_profile:anonymous_profiles!messages_receiver_anon_id_fkey(
            id, nickname, created_at
          )
        `
        )
        .or(
          `and(sender_anon_id.eq.${profile.id},receiver_anon_id.eq.${contactProfileId}),and(sender_anon_id.eq.${contactProfileId},receiver_anon_id.eq.${profile.id})`
        )
        .eq("status", "approved")
        .order("created_at", { ascending: true });

      if (error) {
        this.handleError(error, "fetch messages");
      }

      return data || [];
    } catch (error) {
      this.handleError(error, "fetch messages");
    }
  }

  /**
   * Busca lista de contatos (últimas conversas) com contador de mensagens não lidas
   */
  async getContacts(): Promise<MessageWithDetails[]> {
    try {
      const profile = await this.requireProfile();

      // Busca as últimas mensagens de cada conversa
      const { data, error } = await this.supabase
        .from("messages")
        .select(
          `
          *,
          sender_profile:anonymous_profiles!messages_sender_anon_id_fkey(
            id, nickname, created_at
          ),
          receiver_profile:anonymous_profiles!messages_receiver_anon_id_fkey(
            id, nickname, created_at
          )
        `
        )
        .or(`sender_anon_id.eq.${profile.id},receiver_anon_id.eq.${profile.id}`)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        this.handleError(error, "fetch contacts");
      }

      // Agrupa por contato e pega apenas a última mensagem
      const contactMap = new Map<string, MessageWithDetails>();

      data?.forEach((message) => {
        const contactId =
          message.sender_anon_id === profile.id
            ? message.receiver_anon_id
            : message.sender_anon_id;

        if (!contactMap.has(contactId)) {
          contactMap.set(contactId, message);
        }
      });

      return Array.from(contactMap.values());
    } catch (error) {
      this.handleError(error, "fetch contacts");
    }
  }

  /**
   * Envia uma mensagem
   */
  async sendMessage(messageData: {
    receiverProfileId: string;
    content: string;
  }): Promise<Message> {
    try {
      const { receiverProfileId, content } = messageData;
      const profile = await this.requireProfile();

      // Prevent sending messages to oneself
      if (profile.id === receiverProfileId) {
        throw new Error("Cannot send messages to yourself");
      }

      const { data, error } = await this.supabase
        .from("messages")
        .insert({
          sender_anon_id: profile.id,
          receiver_anon_id: receiverProfileId,
          content: content.trim(),
          status: "approved" as StatusEnum, // DMs aprovadas por padrão
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, "send message");
      }

      return data;
    } catch (error) {
      this.handleError(error, "send message");
    }
  }

  /**
   * Marca mensagens como lidas
   */
  async markMessagesAsRead(senderProfileId: string): Promise<void> {
    try {
      const profile = await this.requireProfile();

      const { error } = await this.supabase
        .from("messages")
        .update({ seen_at: new Date().toISOString() })
        .eq("sender_anon_id", senderProfileId)
        .eq("receiver_anon_id", profile.id)
        .is("seen_at", null);

      if (error) {
        this.handleError(error, "mark messages as read");
      }
    } catch (error) {
      this.handleError(error, "mark messages as read");
    }
  }

  /**
   * Conta mensagens não lidas de um contato
   */
  async getUnreadCount(senderProfileId: string): Promise<number> {
    try {
      const profile = await this.requireProfile();

      const { count, error } = await this.supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("sender_anon_id", senderProfileId)
        .eq("receiver_anon_id", profile.id)
        .is("seen_at", null)
        .eq("status", "approved");

      if (error) {
        this.handleError(error, "count unread messages");
      }

      return count || 0;
    } catch (error) {
      this.handleError(error, "count unread messages");
    }
  }

  /**
   * Conta total de mensagens não lidas
   */
  async getTotalUnreadCount(): Promise<number> {
    try {
      const profile = await this.requireProfile();

      const { count, error } = await this.supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_anon_id", profile.id)
        .is("seen_at", null)
        .eq("status", "approved");

      if (error) {
        this.handleError(error, "count total unread messages");
      }

      return count || 0;
    } catch (error) {
      this.handleError(error, "count total unread messages");
    }
  }

  /**
   * Verifica se há mensagens não lidas (mais performático que contar)
   */
  async hasUnreadMessages(): Promise<boolean> {
    try {
      const profile = await this.requireProfile();

      const { data, error } = await this.supabase
        .from("messages")
        .select("id")
        .eq("receiver_anon_id", profile.id)
        .is("seen_at", null)
        .eq("status", "approved")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        this.handleError(error, "check unread messages");
      }

      return !!data;
    } catch (error) {
      this.handleError(error, "check unread messages");
      return false;
    }
  }

  /**
   * Deleta uma mensagem (apenas o remetente pode deletar)
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const profile = await this.requireProfile();

      const { error } = await this.supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("sender_anon_id", profile.id);

      if (error) {
        this.handleError(error, "delete message");
      }
    } catch (error) {
      this.handleError(error, "delete message");
    }
  }

  /**
   * Busca uma mensagem específica
   */
  async getMessageById(messageId: string): Promise<MessageWithDetails | null> {
    try {
      const { data, error } = await this.supabase
        .from("messages")
        .select(
          `
          *,
          sender_profile:anonymous_profiles!messages_sender_anon_id_fkey(
            id, nickname, created_at
          ),
          receiver_profile:anonymous_profiles!messages_receiver_anon_id_fkey(
            id, nickname, created_at
          )
        `
        )
        .eq("id", messageId)
        .eq("status", "approved")
        .single();

      if (error && error.code !== "PGRST116") {
        this.handleError(error, "fetch message by ID");
      }

      return data;
    } catch (error) {
      this.handleError(error, "fetch message by ID");
    }
  }

  /**
   * Busca mensagens por conteúdo
   */
  async searchMessages(query: string): Promise<MessageWithDetails[]> {
    try {
      const profile = await this.requireProfile();

      if (!query || query.length < 2) {
        return [];
      }

      const { data, error } = await this.supabase
        .from("messages")
        .select(
          `
          *,
          sender_profile:anonymous_profiles!messages_sender_anon_id_fkey(
            id, nickname, created_at
          ),
          receiver_profile:anonymous_profiles!messages_receiver_anon_id_fkey(
            id, nickname, created_at
          )
        `
        )
        .or(`sender_anon_id.eq.${profile.id},receiver_anon_id.eq.${profile.id}`)
        .eq("status", "approved")
        .ilike("content", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        this.handleError(error, "search messages");
      }

      return data || [];
    } catch (error) {
      this.handleError(error, "search messages");
    }
  }
}

// Instância singleton do serviço
export const messageService = new MessageService();
