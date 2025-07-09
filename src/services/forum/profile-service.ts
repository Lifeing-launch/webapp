import { forumClient } from "@/utils/supabase/forum";
import { AnonymousProfile } from "@/typing/forum";
import type { User } from "@supabase/supabase-js";

/**
 * Cache entry structure for user and profile data
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * ProfileService with caching to reduce redundant Supabase Auth calls
 *
 * Performance improvements:
 * - Uses getSession() instead of getUser() when possible (no network request)
 * - Caches user session and profile data with TTL
 * - Provides cache invalidation methods
 */
export class ProfileService {
  private supabase = forumClient;

  // Cache configurations
  private readonly USER_CACHE_TTL = 60 * 1000; // 1 minute
  private readonly PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Cache storage
  private userCache: CacheEntry<User | null> | null = null;
  private profileCache: CacheEntry<AnonymousProfile | null> | null = null;

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid<T>(cache: CacheEntry<T> | null): boolean {
    if (!cache) return false;
    return Date.now() - cache.timestamp < cache.ttl;
  }

  /**
   * Get cached user or fetch from session/auth
   * Uses getSession() first (no network request), falls back to getUser() if needed
   */
  private async getCachedUser(): Promise<User | null> {
    // Return cached user if valid
    if (this.isCacheValid(this.userCache)) {
      return this.userCache!.data;
    }

    try {
      // First try getSession() - no network request
      const { data: sessionData } = await this.supabase.auth.getSession();

      if (sessionData.session?.user) {
        // Cache the user from session
        this.userCache = {
          data: sessionData.session.user,
          timestamp: Date.now(),
          ttl: this.USER_CACHE_TTL,
        };
        return sessionData.session.user;
      }

      // Fallback to getUser() if no session (network request)
      const { data: userData } = await this.supabase.auth.getUser();

      // Cache the result (even if null)
      this.userCache = {
        data: userData.user,
        timestamp: Date.now(),
        ttl: this.USER_CACHE_TTL,
      };

      return userData.user;
    } catch (error) {
      console.error("Error getting user:", error);
      // Cache null result to avoid repeated errors
      this.userCache = {
        data: null,
        timestamp: Date.now(),
        ttl: this.USER_CACHE_TTL,
      };
      return null;
    }
  }

  /**
   * Get current anonymous profile with caching
   */
  async getCurrentProfile(): Promise<AnonymousProfile | null> {
    // Return cached profile if valid
    if (this.isCacheValid(this.profileCache)) {
      return this.profileCache!.data;
    }

    try {
      const user = await this.getCachedUser();

      if (!user) {
        // Cache null result
        this.profileCache = {
          data: null,
          timestamp: Date.now(),
          ttl: this.PROFILE_CACHE_TTL,
        };
        return null;
      }

      const { data, error } = await this.supabase
        .from("anonymous_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Profile not found - cache null
          this.profileCache = {
            data: null,
            timestamp: Date.now(),
            ttl: this.PROFILE_CACHE_TTL,
          };
          return null;
        }
        throw error;
      }

      // Cache successful result
      this.profileCache = {
        data: data,
        timestamp: Date.now(),
        ttl: this.PROFILE_CACHE_TTL,
      };

      return data;
    } catch (err) {
      console.error("Error fetching anonymous profile:", err);
      // Cache null on error to prevent repeated failures
      this.profileCache = {
        data: null,
        timestamp: Date.now(),
        ttl: this.PROFILE_CACHE_TTL,
      };
      return null;
    }
  }

  async requireProfile(): Promise<AnonymousProfile> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error("Anonymous profile required");
    }
    return profile;
  }

  async createProfile(nickname: string): Promise<AnonymousProfile> {
    const user = await this.getCachedUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await this.supabase
      .from("anonymous_profiles")
      .insert({
        user_id: user.id,
        nickname: nickname.trim(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Invalidate profile cache since we created a new profile
    this.invalidateProfileCache();

    return data;
  }

  async updateProfile(nickname: string): Promise<AnonymousProfile> {
    const profile = await this.requireProfile();

    const { data, error } = await this.supabase
      .from("anonymous_profiles")
      .update({ nickname: nickname.trim() })
      .eq("id", profile.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Invalidate profile cache since we updated the profile
    this.invalidateProfileCache();

    return data;
  }

  async deleteProfile(): Promise<void> {
    try {
      const profile = await this.requireProfile();

      const { error } = await this.supabase
        .from("anonymous_profiles")
        .delete()
        .eq("id", profile.id);

      if (error) {
        throw error;
      }

      // Invalidate profile cache since we deleted the profile
      this.invalidateProfileCache();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete profile";
      throw new Error(errorMessage);
    }
  }

  async isNicknameAvailable(nickname: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("anonymous_profiles")
        .select("id")
        .eq("nickname", nickname.trim())
        .single();

      if (error && error.code === "PGRST116") {
        return true;
      }

      if (error) {
        throw error;
      }

      return false;
    } catch (err) {
      console.error("Error checking nickname availability:", err);
      return false;
    }
  }

  /**
   * Search for anonymous profiles by nickname
   */
  async searchProfiles(searchQuery: string): Promise<AnonymousProfile[]> {
    try {
      if (!searchQuery.trim()) {
        return [];
      }

      const { data, error } = await this.supabase
        .from("anonymous_profiles")
        .select("*")
        .ilike("nickname", `%${searchQuery.trim()}%`)
        .limit(10);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error("Error searching profiles:", err);
      return [];
    }
  }

  // ===================================================================
  // CACHE MANAGEMENT METHODS
  // ===================================================================

  /**
   * Invalidate user cache (e.g., after logout)
   */
  invalidateUserCache(): void {
    this.userCache = null;
  }

  /**
   * Invalidate profile cache (e.g., after profile update)
   */
  invalidateProfileCache(): void {
    this.profileCache = null;
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.userCache = null;
    this.profileCache = null;
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus() {
    return {
      userCache: {
        hasData: !!this.userCache,
        isValid: this.isCacheValid(this.userCache),
        age: this.userCache ? Date.now() - this.userCache.timestamp : null,
      },
      profileCache: {
        hasData: !!this.profileCache,
        isValid: this.isCacheValid(this.profileCache),
        age: this.profileCache
          ? Date.now() - this.profileCache.timestamp
          : null,
      },
    };
  }
}

export const profileService = new ProfileService();
