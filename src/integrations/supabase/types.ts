export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          stream_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          stream_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          stream_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          thumbnail_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          thumbnail_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_last_updated_at: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          updated_at: string
          username: string
          wallet_address: string
        }
        Insert: {
          avatar_last_updated_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username: string
          wallet_address: string
        }
        Update: {
          avatar_last_updated_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
          wallet_address?: string
        }
        Relationships: []
      }
      stream_muted_users: {
        Row: {
          created_at: string
          id: string
          muted_by: string
          muted_user_id: string
          reason: string | null
          stream_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          muted_by: string
          muted_user_id: string
          reason?: string | null
          stream_id: string
        }
        Update: {
          created_at?: string
          id?: string
          muted_by?: string
          muted_user_id?: string
          reason?: string | null
          stream_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_muted_users_muted_by_fkey"
            columns: ["muted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_muted_users_muted_by_fkey"
            columns: ["muted_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_muted_users_muted_user_id_fkey"
            columns: ["muted_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_muted_users_muted_user_id_fkey"
            columns: ["muted_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_muted_users_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      streamer_blocked_users: {
        Row: {
          blocked_user_id: string
          created_at: string
          id: string
          reason: string | null
          streamer_id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string
          id?: string
          reason?: string | null
          streamer_id: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          streamer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streamer_blocked_users_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streamer_blocked_users_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streamer_blocked_users_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streamer_blocked_users_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streams: {
        Row: {
          description: string | null
          ended_at: string | null
          game_category: string | null
          game_id: string | null
          id: string
          is_live: boolean | null
          livepeer_stream_id: string | null
          playback_id: string | null
          playback_url: string | null
          started_at: string | null
          streamer_id: string
          tags: string[] | null
          title: string
          viewer_count: number | null
        }
        Insert: {
          description?: string | null
          ended_at?: string | null
          game_category?: string | null
          game_id?: string | null
          id?: string
          is_live?: boolean | null
          livepeer_stream_id?: string | null
          playback_id?: string | null
          playback_url?: string | null
          started_at?: string | null
          streamer_id: string
          tags?: string[] | null
          title: string
          viewer_count?: number | null
        }
        Update: {
          description?: string | null
          ended_at?: string | null
          game_category?: string | null
          game_id?: string | null
          id?: string
          is_live?: boolean | null
          livepeer_stream_id?: string | null
          playback_id?: string | null
          playback_url?: string | null
          started_at?: string | null
          streamer_id?: string
          tags?: string[] | null
          title?: string
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "streams_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streams_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streams_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          amount_eth: number
          created_at: string
          from_wallet: string | null
          id: string
          receiver_id: string
          sender_id: string
          stream_id: string
          to_wallet: string | null
          tx_hash: string
        }
        Insert: {
          amount_eth: number
          created_at?: string
          from_wallet?: string | null
          id?: string
          receiver_id: string
          sender_id: string
          stream_id: string
          to_wallet?: string | null
          tx_hash: string
        }
        Update: {
          amount_eth?: number
          created_at?: string
          from_wallet?: string | null
          id?: string
          receiver_id?: string
          sender_id?: string
          stream_id?: string
          to_wallet?: string | null
          tx_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "tips_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rate_limits: {
        Row: {
          action_count: number | null
          action_type: string
          last_message: string | null
          last_message_at: string | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          action_count?: number | null
          action_type: string
          last_message?: string | null
          last_message_at?: string | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          action_count?: number | null
          action_type?: string
          last_message?: string | null
          last_message_at?: string | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_duplicate_message: {
        Args: { p_message: string; p_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_max_actions: number
          p_user_id: string
          p_window_seconds: number
        }
        Returns: boolean
      }
      get_my_stream_key: { Args: { p_stream_id: string }; Returns: string }
      is_own_profile: { Args: { profile_id: string }; Returns: boolean }
      is_profile_complete: { Args: { p_user_id: string }; Returns: boolean }
      is_user_blocked_from_stream: {
        Args: { p_stream_id: string; p_user_id: string }
        Returns: boolean
      }
      store_stream_key: {
        Args: { p_stream_id: string; p_stream_key: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
