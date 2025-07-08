import { forumClient } from "@/utils/supabase/forum";
import { AnonymousProfile } from "@/typing/forum";

export class ProfileService {
  private supabase = forumClient;

  async getCurrentProfile(): Promise<AnonymousProfile | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const { data, error } = await this.supabase
        .from("anonymous_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Error fetching anonymous profile:", err);
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
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

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
      // Preserve the original Supabase error
      throw error;
    }

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
      // Preserve the original Supabase error
      throw error;
    }

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
}

export const profileService = new ProfileService();
