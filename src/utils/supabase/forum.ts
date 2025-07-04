import { createClient as createSupabaseClient } from "@/utils/supabase/browser";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase configurado para trabalhar com o schema forum
 * Baseado na documentação: https://supabase.com/docs/guides/api/using-custom-schemas
 */
export class ForumClient {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createSupabaseClient();
  }

  /**
   * Execute uma query no schema forum usando o método .schema()
   * Baseado na documentação oficial do Supabase
   */
  from(table: string) {
    return this.supabase.schema("forum").from(table);
  }

  /**
   * Acesso direto ao cliente para auth e outras operações
   */
  get auth() {
    return this.supabase.auth;
  }

  /**
   * Acesso direto ao cliente para outras operações
   */
  get client() {
    return this.supabase;
  }

  /**
   * Criar canal realtime para tabelas do forum
   */
  channel(name: string) {
    return this.supabase.channel(name);
  }

  /**
   * Remove canal
   */
  removeChannel(channel: ReturnType<SupabaseClient["channel"]>) {
    return this.supabase.removeChannel(channel);
  }
}

/**
 * Cliente padrão com schema forum
 */
export const forumClient = new ForumClient();
