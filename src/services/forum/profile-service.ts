import { forumClient } from "@/utils/supabase/forum";
import { AnonymousProfile } from "@/typing/forum";

/**
 * Serviço centralizado para operações com perfil anônimo
 * Evita redundância com o hook use-anonymous-profile.tsx
 */
export class ProfileService {
  private supabase = forumClient;

  /**
   * Busca o perfil anônimo do usuário atual
   * Mesma lógica do hook use-anonymous-profile.tsx
   */
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
          // Profile não existe
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

  /**
   * Valida se o usuário tem perfil anônimo
   * Lança erro se não tiver
   */
  async requireProfile(): Promise<AnonymousProfile> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error("Anonymous profile required");
    }
    return profile;
  }

  /**
   * Cria um novo perfil anônimo
   * Mesma lógica do hook use-anonymous-profile.tsx
   */
  async createProfile(nickname: string): Promise<AnonymousProfile> {
    try {
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
        throw error;
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create profile";
      throw new Error(errorMessage);
    }
  }

  /**
   * Atualiza o nickname do perfil anônimo
   */
  async updateProfile(nickname: string): Promise<AnonymousProfile> {
    try {
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

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      throw new Error(errorMessage);
    }
  }

  /**
   * Deleta o perfil anônimo
   */
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

  /**
   * Verifica se o nickname está disponível
   */
  async isNicknameAvailable(nickname: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("anonymous_profiles")
        .select("id")
        .eq("nickname", nickname.trim())
        .single();

      if (error && error.code === "PGRST116") {
        // Nickname não existe, está disponível
        return true;
      }

      if (error) {
        throw error;
      }

      // Nickname já existe
      return false;
    } catch (err) {
      console.error("Error checking nickname availability:", err);
      return false;
    }
  }
}

// Instância singleton do serviço
export const profileService = new ProfileService();
