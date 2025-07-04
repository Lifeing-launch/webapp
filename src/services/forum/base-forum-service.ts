import { forumClient } from "@/utils/supabase/forum";
import { AnonymousProfile } from "@/typing/forum";
import { profileService } from "./profile-service";

/**
 * Classe base para todos os serviços do fórum
 * Contém funcionalidades comuns como autenticação e tratamento de erros
 *
 * NOTA: A lógica de perfil anônimo foi movida para ProfileService
 * para evitar redundância com use-anonymous-profile.tsx
 */
export abstract class BaseForumService {
  protected supabase = forumClient;
  protected profileService = profileService;

  /**
   * Busca o perfil anônimo do usuário atual
   * Delega para ProfileService para evitar redundância
   */
  protected async getCurrentProfile(): Promise<AnonymousProfile | null> {
    return this.profileService.getCurrentProfile();
  }

  /**
   * Valida se o usuário tem perfil anônimo
   * Delega para ProfileService para evitar redundância
   */
  protected async requireProfile(): Promise<AnonymousProfile> {
    return this.profileService.requireProfile();
  }

  /**
   * Tratamento padrão de erros do Supabase
   */
  protected handleError(error: unknown, operation: string): never {
    console.error(`Error in ${operation}:`, error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to ${operation}: ${message}`);
  }
}
