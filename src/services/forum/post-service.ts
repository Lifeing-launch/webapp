import { BaseForumService } from "./base-forum-service";
import {
  Comment,
  Category,
  Post,
  PostWithDetails,
  StatusEnum,
  Tag,
  AnonymousProfile,
} from "@/typing/forum";

interface SupabasePostResponse {
  id: string;
  group_id: string | null;
  author_anon_id: string;
  category_id: string | null;
  title: string | null;
  content: string;
  status: StatusEnum;
  created_at: string;
  author_profile: AnonymousProfile | null;
  group: { id: string; name: string; description: string | null } | null;
  category: Category | null;
  tags: Array<{ tag: Tag }>;
  likes_count: Array<{ count: number }>;
  comments_count: Array<{ count: number }>;
}

export class PostService extends BaseForumService {
  async getPosts(
    options: {
      groupId?: string;
      limit?: number;
      offset?: number;
      searchQuery?: string;
      tagId?: string;
      categoryId?: string;
      onlyForum?: boolean;
    } = {}
  ): Promise<PostWithDetails[]> {
    try {
      const {
        groupId,
        limit = 100,
        offset = 0,
        searchQuery,
        tagId,
        categoryId,
      } = options;

      let query = this.supabase.from("posts").select(`
        *,
        author_profile:anonymous_profiles!posts_author_anon_id_fkey(id, nickname),
        group:groups(id, name, description),
        category:categories(id, name, description),
        tags:post_tags(tag:tags(id, name)),
        likes_count:likes(count)
      `);

      if (options.onlyForum) {
        query = query.is("group_id", null);
      } else if (groupId) {
        query = query.eq("group_id", groupId);
      }

      if (searchQuery) {
        query = query.ilike("content", `%${searchQuery}%`);
      }

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      if (tagId) {
        const { data: postIds, error: tagError } = await this.supabase
          .from("post_tags")
          .select("post_id")
          .eq("tag_id", tagId);

        if (tagError) {
          this.handleError(tagError, "fetch posts by tag");
        }

        if (!postIds || postIds.length === 0) {
          return [];
        }

        const postIdList = postIds.map((item) => item.post_id);
        query = query.in("id", postIdList);
      }

      const profile = await this.getCurrentProfile();

      if (profile) {
        query = query.or(`status.eq.approved,author_anon_id.eq.${profile.id}`);
      } else {
        query = query.eq("status", "approved");
      }

      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: rawPosts, error } = await query;

      if (error) {
        this.handleError(error, "fetch posts");
      }

      if (!rawPosts || rawPosts.length === 0) {
        return [];
      }

      let userLikes: Set<string> = new Set();

      if (profile) {
        const postIds = (rawPosts as SupabasePostResponse[]).map(
          (post) => post.id
        );
        const { data: likesData } = await this.supabase
          .from("likes")
          .select("post_id")
          .eq("anon_profile_id", profile.id)
          .in("post_id", postIds);

        userLikes = new Set(likesData?.map((like) => like.post_id) || []);
      }

      // Buscar contagem de comentários com filtro aplicado
      const postIds = (rawPosts as SupabasePostResponse[]).map(
        (post) => post.id
      );

      let commentsQuery = this.supabase
        .from("comments")
        .select("post_id", { count: "exact" })
        .in("post_id", postIds);

      if (profile) {
        commentsQuery = commentsQuery.or(
          `status.eq.approved,author_anon_id.eq.${profile.id}`
        );
      } else {
        commentsQuery = commentsQuery.eq("status", "approved");
      }

      const { data: commentsData, error: commentsError } = await commentsQuery;

      if (commentsError) {
        console.error("Error fetching comments count:", commentsError);
      }

      // Contar comentários por post
      const commentsCount = new Map<string, number>();
      if (commentsData) {
        commentsData.forEach((comment) => {
          const postId = comment.post_id;
          commentsCount.set(postId, (commentsCount.get(postId) || 0) + 1);
        });
      }

      const postsWithDetails: PostWithDetails[] = (
        rawPosts as SupabasePostResponse[]
      ).map((rawPost) => {
        const tags: Tag[] = (rawPost.tags || []).map(
          (tagWrapper: { tag: Tag }) => ({
            id: tagWrapper.tag.id,
            name: tagWrapper.tag.name,
          })
        );

        const likes_count = rawPost.likes_count?.[0]?.count || 0;
        const comments_count = commentsCount.get(rawPost.id) || 0;

        const is_liked = userLikes.has(rawPost.id);

        return {
          id: rawPost.id,
          group_id: rawPost.group_id,
          author_anon_id: rawPost.author_anon_id,
          category_id: rawPost.category_id,
          title: rawPost.title,
          content: rawPost.content,
          status: rawPost.status,
          created_at: rawPost.created_at,
          author_profile: rawPost.author_profile,
          category: rawPost.category,
          tags,
          likes_count,
          comments_count,
          is_liked,
        } as PostWithDetails;
      });

      return postsWithDetails;
    } catch (error) {
      this.handleError(error, "fetch posts");
    }
  }

  async getTags(): Promise<Tag[]> {
    const { data, error } = await this.supabase.from("tags").select("*");
    if (error) {
      this.handleError(error, "fetch tags");
    }
    return data || [];
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase.from("categories").select("*");
    if (error) {
      this.handleError(error, "fetch categories");
    }
    return data || [];
  }

  async createPost(postData: {
    groupId?: string;
    content: string;
    title?: string;
    categoryId?: string;
    tags?: string[];
  }): Promise<Post> {
    try {
      const { groupId, content, title, categoryId, tags } = postData;
      const profile = await this.requireProfile();

      const { data: post, error: postError } = await this.supabase
        .from("posts")
        .insert({
          group_id: groupId || null,
          author_anon_id: profile.id,
          content: content.trim(),
          title: title?.trim() || null,
          category_id: categoryId || null,
          status: "pending" as StatusEnum,
        })
        .select()
        .single();

      if (postError) {
        this.handleError(postError, "create post");
      }

      if (!post) {
        throw new Error("Failed to create post: post data is null.");
      }

      this.moderatePost(post.id);

      if (tags && tags.length > 0) {
        const tagsToInsert = tags.map((tagId) => ({
          post_id: post.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await this.supabase
          .from("post_tags")
          .insert(tagsToInsert);

        if (tagsError) {
          this.handleError(tagsError, "add tags to post");
        }
      }

      return post;
    } catch (error) {
      this.handleError(error, "create post");
    }
  }

  private async moderatePost(postId: string): Promise<void> {
    try {
      const response = await fetch("/api/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_id: postId,
          resource_type: "post",
        }),
      });

      if (!response.ok) {
        console.error(
          "Moderation API error:",
          response.status,
          response.statusText
        );
        // Don't throw error to prevent blocking post creation
        return;
      }

      const data = await response.json();
      if (data?.success) {
        console.log(`Post ${postId} moderated successfully`);
      }
    } catch (error) {
      console.error("Failed to moderate post:", postId, error);
      // Don't throw error to prevent blocking post creation
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      const profile = await this.requireProfile();

      const { error } = await this.supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("author_anon_id", profile.id);

      if (error) {
        this.handleError(error, "delete post");
      }
    } catch (error) {
      this.handleError(error, "delete post");
    }
  }

  async toggleLike(postId: string): Promise<boolean> {
    try {
      const profile = await this.requireProfile();

      const { data: existingLike } = await this.supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("anon_profile_id", profile.id)
        .maybeSingle();

      if (existingLike) {
        const { error } = await this.supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("anon_profile_id", profile.id);

        if (error) {
          this.handleError(error, "remove like");
        }
        return false;
      } else {
        const { error } = await this.supabase.from("likes").insert({
          post_id: postId,
          anon_profile_id: profile.id,
        });

        if (error) {
          this.handleError(error, "add like");
        }
        return true;
      }
    } catch (error) {
      this.handleError(error, "toggle like");
    }
  }

  async getComments(
    postId: string,
    offset: number = 0,
    limit: number = 100
  ): Promise<{ comments: Comment[]; total: number }> {
    const { data, error, count } = await this.supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("post_id", postId)
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
}

export const postService = new PostService();
