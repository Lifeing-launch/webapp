/**
 * Forum Services - Exportação centralizada
 *
 * Esta arquitetura modular substitui o antigo forum-service.ts
 * dividindo as responsabilidades em serviços especializados:
 *
 * - BaseForumService: Funcionalidades comuns (auth, profile, error handling)
 * - ProfileService: Operações com perfil anônimo (centralizado)
 * - PostService: Operações com posts e likes + realtime
 * - CommentService: Operações com comentários + realtime
 * - MessageService: Operações com DMs + realtime
 * - GroupService: Operações com grupos (implementado)
 * - ThreadService: Operações com threads (a ser implementado)
 */

import { commentService } from "./comment-service";
import { groupService } from "./group-service";
import { messageService } from "./message-service";
import { postService } from "./post-service";
import { profileService } from "./profile-service";

// Serviços base
export { BaseForumService } from "./base-forum-service";
export { ProfileService, profileService } from "./profile-service";

// Serviços especializados
export { PostService, postService } from "./post-service";
export { CommentService, commentService } from "./comment-service";
export { MessageService, messageService } from "./message-service";
export { GroupService, groupService } from "./group-service";

// Utilitários de realtime
export {
  subscribeToThreadPosts,
  subscribeToPostComments,
  subscribeToPostLikes,
  subscribeToUserMessages,
  subscribeToConversation,
  type RealtimeSubscription,
  type RealtimeLikePayload,
} from "@/utils/supabase/realtime-config";

// Classe agregadora compatível com o antigo ForumService
export class ForumService {
  // Instâncias dos serviços especializados
  public readonly posts = postService;
  public readonly comments = commentService;
  public readonly messages = messageService;
  public readonly groups = groupService;
  public readonly profile = profileService;

  // Métodos para compatibilidade com o código existente
  async getPosts(options?: Parameters<typeof postService.getPosts>[0]) {
    return this.posts.getPosts(options);
  }

  async createPost(postData: Parameters<typeof postService.createPost>[0]) {
    return this.posts.createPost(postData);
  }

  async toggleLike(postId: string) {
    return this.posts.toggleLike(postId);
  }

  async getComments(postId: string) {
    return this.comments.getComments(postId);
  }

  async createComment(
    commentData: Parameters<typeof commentService.createComment>[0]
  ) {
    return this.comments.createComment(commentData);
  }

  async getMessages(contactProfileId: string) {
    return this.messages.getMessages(contactProfileId);
  }

  async sendMessage(
    messageData: Parameters<typeof messageService.sendMessage>[0]
  ) {
    return this.messages.sendMessage(messageData);
  }

  // Métodos de perfil anônimo
  async getCurrentProfile() {
    return this.profile.getCurrentProfile();
  }

  async createProfile(nickname: string) {
    return this.profile.createProfile(nickname);
  }

  async updateProfile(nickname: string) {
    return this.profile.updateProfile(nickname);
  }

  async isNicknameAvailable(nickname: string) {
    return this.profile.isNicknameAvailable(nickname);
  }

  // Métodos de grupos
  async getGroups(options?: Parameters<typeof groupService.getGroups>[0]) {
    return this.groups.getGroups(options);
  }

  async createGroup(groupData: Parameters<typeof groupService.createGroup>[0]) {
    return this.groups.createGroup(groupData);
  }

  async joinGroup(groupId: string) {
    return this.groups.joinGroup(groupId);
  }

  async getGroupMembers(
    groupId: string,
    options?: Parameters<typeof groupService.getGroupMembers>[1]
  ) {
    return this.groups.getGroupMembers(groupId, options);
  }
}

// Instância singleton compatível
export const forumService = new ForumService();

// Export default para compatibilidade
export default forumService;
