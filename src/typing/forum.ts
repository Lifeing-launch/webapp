// =============================================================================
// FORUM DATABASE TYPES - Based on Supabase Schema
// =============================================================================

export type StatusEnum = "pending" | "approved" | "rejected";
export type GroupTypeEnum = "public" | "private";
export type UserRole = "owner" | "member" | "moderator";

// =============================================================================
// CORE ENTITIES - Database-Aligned
// =============================================================================

export interface AnonymousProfile {
  id: string;
  user_id: string;
  nickname: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface ForumGroup {
  id: string;
  name: string;
  description?: string;
  group_type: GroupTypeEnum;
  owner_anon_id: string;
  created_at: string;
  members_count: number;
}

export interface GroupMember {
  anon_profile_id: string;
  group_id: string;
  is_approved: boolean;
  role: string;
  created_at: string;
}

export interface Thread {
  id: string;
  group_id?: string;
  author_anon_id: string;
  title: string;
  created_at: string;
}

export interface Post {
  id: string;
  group_id?: string; // null = fórum geral
  author_anon_id: string;
  category_id?: string;
  title?: string; // opcional: para posts que funcionam como threads
  content: string;
  status: StatusEnum;
  created_at: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
}

export interface Like {
  post_id: string;
  anon_profile_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_anon_id: string;
  author_profile: AnonymousProfile;
  parent_comment_id?: string;
  content: string;
  status: StatusEnum;
  created_at: string;
}

export interface Message {
  id: string;
  sender_anon_id: string;
  receiver_anon_id: string;
  content: string;
  status: StatusEnum;
  created_at: string;
  seen_at?: string;
}

export interface ModerationLog {
  id: number;
  resource_type: string;
  resource_id: string;
  action: StatusEnum;
  reviewer_anon_id: string;
  reason?: string;
  created_at: string;
}

// =============================================================================
// REQUEST/RESPONSE TYPES
// =============================================================================

export interface CreatePostRequest {
  thread_id?: string;
  category_id?: string;
  content: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  post_id: string;
  parent_comment_id?: string;
  content: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  group_type: GroupTypeEnum;
}

export interface JoinGroupRequest {
  group_id: string;
}

export interface SendMessageRequest {
  receiver_anon_id: string;
  content: string;
}

// =============================================================================
// QUERY TYPES
// =============================================================================

export interface PostsQuery {
  thread_id?: string;
  category_id?: string;
  tag_ids?: string[];
  search?: string;
  status?: StatusEnum;
  limit?: number;
  offset?: number;
}

export interface CommentsQuery {
  post_id: string;
  limit?: number;
  offset?: number;
}

export interface MessagesQuery {
  contact_id?: string;
  limit?: number;
  offset?: number;
}

export interface GroupsQuery {
  group_type?: GroupTypeEnum;
  joined?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

// =============================================================================
// PAGINATION AND RESPONSE TYPES
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  nextOffset?: number;
  hasMore: boolean;
}

export interface ForumStats {
  totalPosts: number;
  totalComments: number;
  totalGroups: number;
  totalMembers: number;
  activeUsers: number;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export interface ForumError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export interface PostValidation {
  content: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
}

export interface GroupValidation {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  description: {
    maxLength: number;
  };
}

export interface MessageValidation {
  content: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
}

// =============================================================================
// REALTIME SUBSCRIPTION TYPES
// =============================================================================

export interface RealtimePostPayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Post;
  old: Post;
}

export interface RealtimeCommentPayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Comment;
  old: Comment;
}

export interface RealtimeMessagePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Message;
  old: Message;
}

// =============================================================================
// LEGACY TYPES (for backward compatibility - to be removed gradually)
// =============================================================================

/** @deprecated Use ForumGroup instead - keeping for backward compatibility */
export interface Group {
  id: number;
  name: string;
  avatarColor: string;
  unreadCount?: number;
  // Migration fields
  members?: number;
  description?: string;
  isPrivate?: boolean;
  isJoined?: boolean;
}

/** @deprecated Use AnonymousProfile instead - keeping for backward compatibility */
export interface DMContact {
  id: string;
  username: string;
  avatarColor: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isActive?: boolean;
}

/** @deprecated Use ForumPost instead - keeping for backward compatibility */
export interface GroupThread {
  id: string;
  title: string;
  username: string;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  avatarColor: string;
  isLiked?: boolean;
  isPinned?: boolean;
}

/** @deprecated Define proper request type - keeping for backward compatibility */
export interface GroupJoinRequest {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  requestedAt: string;
  groupId: string;
  groupName: string;
}

// =============================================================================
// UI-SPECIFIC TYPES
// =============================================================================

// Avatar props simplified - only need initials and fixed bg-primary color
export interface AvatarProps {
  initials: string;
  color: string;
}

// =============================================================================
// HOOK STATE TYPES
// =============================================================================

export interface ForumState {
  posts: Post[];
  loading: boolean;
  error: ForumError | null;
  hasMore: boolean;
  nextOffset?: number;
}

export interface MessagingState {
  contacts: DMContact[];
  messages: Message[];
  selectedContactId: string | null;
  loading: boolean;
  error: ForumError | null;
}

export interface GroupState {
  groups: ForumGroup[];
  loading: boolean;
  error: ForumError | null;
  selectedGroup: ForumGroup | null;
}

// =============================================================================
// ENRICHED TYPES FOR API RESPONSES
// =============================================================================
//
// These interfaces extend the base database types with joined data and computed fields
// that are returned by the API services. Use these for UI components that need enriched data.
//
// Base interfaces (Post, Comment, etc.) = Database fields only
// WithDetails interfaces = API response with joined data and computed fields
// =============================================================================

export interface PostWithDetails extends Post {
  author_profile: AnonymousProfile;
  category?: Category;
  tags: Tag[];
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export interface CommentWithDetails extends Comment {
  author_profile: AnonymousProfile;
  replies?: CommentWithDetails[];
}

export interface ThreadWithDetails extends Thread {
  author_profile: AnonymousProfile;
  group?: ForumGroup;
  posts_count: number;
  latest_post_at?: string;
}

export interface MessageWithDetails extends Message {
  sender_profile: AnonymousProfile;
  receiver_profile: AnonymousProfile;
}

export interface GroupWithDetails extends ForumGroup {
  owner_profile: AnonymousProfile;
  members_count: number;
  is_member: boolean;
  is_owner: boolean;
  isJoined: boolean;
  member_status?: "pending" | "approved";
}

export interface GroupMemberWithDetails extends GroupMember {
  profile: AnonymousProfile;
  group: ForumGroup;
}
