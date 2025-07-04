import { BaseForumService } from "./base-forum-service";
import {
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
        limit = 20,
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
        likes_count:likes(count),
        comments_count:comments(count)
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

      query = query
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: rawPosts, error } = await query;

      if (error) {
        this.handleError(error, "fetch posts");
      }

      if (!rawPosts || rawPosts.length === 0) {
        return [];
      }

      const profile = await this.getCurrentProfile();
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
        const comments_count = rawPost.comments_count?.[0]?.count || 0;

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
  }): Promise<Post> {
    try {
      const { groupId, content, title, categoryId } = postData;
      const profile = await this.requireProfile();

      const { data, error } = await this.supabase
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

      if (error) {
        this.handleError(error, "create post");
      }

      return data;
    } catch (error) {
      this.handleError(error, "create post");
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
}

export const postService = new PostService();
