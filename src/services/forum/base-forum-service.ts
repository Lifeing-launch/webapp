import { forumClient } from "@/utils/supabase/forum";
import { AnonymousProfile } from "@/typing/forum";
import { profileService } from "./profile-service";

export abstract class BaseForumService {
  protected supabase = forumClient;
  protected profileService = profileService;

  protected async getCurrentProfile(): Promise<AnonymousProfile | null> {
    return this.profileService.getCurrentProfile();
  }

  protected async requireProfile(): Promise<AnonymousProfile> {
    return this.profileService.requireProfile();
  }

  protected handleError(error: unknown, operation: string): never {
    console.error(`Error in ${operation}:`, error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to ${operation}: ${message}`);
  }
}
