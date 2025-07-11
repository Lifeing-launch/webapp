export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string;
          id: string;
          resource_id: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          resource_id?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          resource_id?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      rsvps: {
        Row: {
          id: string;
          meeting_id: number;
          rsvp_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          meeting_id: number;
          rsvp_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          meeting_id?: number;
          rsvp_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rsvps_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          amount: number;
          billing_interval: string;
          cancel_at: string | null;
          cancel_reason: string | null;
          canceled_at: string | null;
          card_last4: string | null;
          card_type: string | null;
          created_at: string;
          current_period_end: string;
          current_period_start: string;
          failed_at: string | null;
          id: string;
          plan_id: number;
          status: string;
          stripe_customer_id: string;
          stripe_price_id: string;
          stripe_subscription_id: string;
          trial_end: string | null;
          trial_start: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          billing_interval: string;
          cancel_at?: string | null;
          cancel_reason?: string | null;
          canceled_at?: string | null;
          card_last4?: string | null;
          card_type?: string | null;
          created_at?: string;
          current_period_end: string;
          current_period_start: string;
          failed_at?: string | null;
          id?: string;
          plan_id: number;
          status: string;
          stripe_customer_id: string;
          stripe_price_id?: string | null;
          stripe_subscription_id: string;
          trial_end?: string | null;
          trial_start?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          billing_interval?: string;
          cancel_at?: string | null;
          cancel_reason?: string | null;
          canceled_at?: string | null;
          card_last4?: string | null;
          card_type?: string | null;
          created_at?: string;
          current_period_end?: string;
          current_period_start?: string;
          failed_at?: string | null;
          id?: string;
          plan_id?: number;
          status?: string;
          stripe_customer_id?: string;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string;
          trial_end?: string | null;
          trial_start?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      active_subscriptions: {
        Row: {
          billing_interval: string | null;
          cancel_at: string | null;
          cancel_reason: string | null;
          canceled_at: string | null;
          card_last4: string | null;
          card_type: string | null;
          created_at: string | null;
          current_period_end: string | null;
          current_period_start: string | null;
          failed_at: string | null;
          id: string | null;
          plan_id: number | null;
          status: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          trial_end: string | null;
          trial_start: string | null;
          user_id: string | null;
        };
        Insert: {
          billing_interval?: string | null;
          cancel_at?: string | null;
          cancel_reason?: string | null;
          canceled_at?: string | null;
          card_last4?: string | null;
          card_type?: string | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          failed_at?: string | null;
          id?: string | null;
          plan_id?: number | null;
          status?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_end?: string | null;
          trial_start?: string | null;
          user_id?: string | null;
        };
        Update: {
          billing_interval?: string | null;
          cancel_at?: string | null;
          cancel_reason?: string | null;
          canceled_at?: string | null;
          card_last4?: string | null;
          card_type?: string | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          failed_at?: string | null;
          id?: string | null;
          plan_id?: number | null;
          status?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_end?: string | null;
          trial_start?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
