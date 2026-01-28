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
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
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
      communities: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_ens_gated: boolean | null
          is_nft_gated: boolean | null
          member_count: number | null
          name: string
          nft_contract_address: string | null
          owner_id: string
          required_ens_suffix: string | null
          rules: string | null
          short_description: string | null
          slug: string
          status: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_ens_gated?: boolean | null
          is_nft_gated?: boolean | null
          member_count?: number | null
          name: string
          nft_contract_address?: string | null
          owner_id: string
          required_ens_suffix?: string | null
          rules?: string | null
          short_description?: string | null
          slug: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_ens_gated?: boolean | null
          is_nft_gated?: boolean | null
          member_count?: number | null
          name?: string
          nft_contract_address?: string | null
          owner_id?: string
          required_ens_suffix?: string | null
          rules?: string | null
          short_description?: string | null
          slug?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_giveaway_entries: {
        Row: {
          entered_at: string | null
          giveaway_id: string
          id: string
          user_id: string
        }
        Insert: {
          entered_at?: string | null
          giveaway_id: string
          id?: string
          user_id: string
        }
        Update: {
          entered_at?: string | null
          giveaway_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_giveaway_entries_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "community_giveaways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_giveaway_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_giveaway_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_giveaways: {
        Row: {
          created_at: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          post_id: string
          prize_amount: number | null
          prize_type: string | null
          title: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          post_id: string
          prize_amount?: number | null
          prize_type?: string | null
          title: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          post_id?: string
          prize_amount?: number | null
          prize_type?: string | null
          title?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_giveaways_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_giveaways_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_giveaways_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "public_communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_poll_votes: {
        Row: {
          id: string
          option_index: number
          poll_id: string
          user_id: string
          voted_at: string | null
        }
        Insert: {
          id?: string
          option_index: number
          poll_id: string
          user_id: string
          voted_at?: string | null
        }
        Update: {
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "community_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_polls: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          options: Json
          post_id: string
          question: string
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          post_id: string
          question: string
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          post_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          community_id: string
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          post_type: string | null
          reactions: Json | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          community_id: string
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          post_type?: string | null
          reactions?: Json | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          community_id?: string
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          post_type?: string | null
          reactions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "public_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reports: {
        Row: {
          admin_notes: string | null
          community_id: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          admin_notes?: string | null
          community_id: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          admin_notes?: string | null
          community_id?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reports_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "public_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
      global_mutes: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          muted_by: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          muted_by: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          muted_by?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          notify_on_live: boolean
          streamer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notify_on_live?: boolean
          streamer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notify_on_live?: boolean
          streamer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_reads: {
        Row: {
          id: string
          notification_key: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_key: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_key?: string
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_last_updated_at: string | null
          avatar_url: string | null
          base_name: string | null
          bio: string | null
          created_at: string
          has_base_name: boolean | null
          id: string
          suspended: boolean | null
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string
          username: string
          verified_creator: boolean | null
          wallet_address: string
        }
        Insert: {
          avatar_last_updated_at?: string | null
          avatar_url?: string | null
          base_name?: string | null
          bio?: string | null
          created_at?: string
          has_base_name?: boolean | null
          id: string
          suspended?: boolean | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          username: string
          verified_creator?: boolean | null
          wallet_address: string
        }
        Update: {
          avatar_last_updated_at?: string | null
          avatar_url?: string | null
          base_name?: string | null
          bio?: string | null
          created_at?: string
          has_base_name?: boolean | null
          id?: string
          suspended?: boolean | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          username?: string
          verified_creator?: boolean | null
          wallet_address?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      scheduled_streams: {
        Row: {
          created_at: string
          description: string | null
          game_id: string | null
          id: string
          is_cancelled: boolean
          scheduled_for: string
          streamer_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          game_id?: string | null
          id?: string
          is_cancelled?: boolean
          scheduled_for: string
          streamer_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          game_id?: string | null
          id?: string
          is_cancelled?: boolean
          scheduled_for?: string
          streamer_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_streams_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_clips: {
        Row: {
          asset_id: string | null
          created_at: string
          duration: number
          id: string
          playback_id: string | null
          start_time: number
          status: string
          stream_id: string
          thumbnail_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          duration?: number
          id?: string
          playback_id?: string | null
          start_time: number
          status?: string
          stream_id: string
          thumbnail_url?: string | null
          title?: string
          user_id: string
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          duration?: number
          id?: string
          playback_id?: string | null
          start_time?: number
          status?: string
          stream_id?: string
          thumbnail_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_clips_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_clips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_clips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      streamer_applications: {
        Row: {
          admin_notes: string | null
          bio: string
          content_type: string | null
          created_at: string
          id: string
          primary_game_id: string | null
          prior_experience: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          socials: Json | null
          status: string
          streaming_frequency: string | null
          user_id: string
          username: string
          why_stream: string | null
        }
        Insert: {
          admin_notes?: string | null
          bio: string
          content_type?: string | null
          created_at?: string
          id?: string
          primary_game_id?: string | null
          prior_experience?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          socials?: Json | null
          status?: string
          streaming_frequency?: string | null
          user_id: string
          username: string
          why_stream?: string | null
        }
        Update: {
          admin_notes?: string | null
          bio?: string
          content_type?: string | null
          created_at?: string
          id?: string
          primary_game_id?: string | null
          prior_experience?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          socials?: Json | null
          status?: string
          streaming_frequency?: string | null
          user_id?: string
          username?: string
          why_stream?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streamer_applications_primary_game_id_fkey"
            columns: ["primary_game_id"]
            isOneToOne: false
            referencedRelation: "games"
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
          flag_reason: string | null
          flagged: boolean | null
          game_category: string | null
          game_id: string | null
          hidden: boolean | null
          id: string
          is_live: boolean | null
          livepeer_stream_id: string | null
          playback_id: string | null
          playback_url: string | null
          recording_asset_id: string | null
          recording_url: string | null
          started_at: string | null
          streamer_id: string
          tags: string[] | null
          thumbnail_url: string | null
          tip_goal_amount_eth: number | null
          tip_goal_enabled: boolean
          tip_goal_title: string | null
          tip_goal_updated_at: string
          title: string
          viewer_count: number | null
        }
        Insert: {
          description?: string | null
          ended_at?: string | null
          flag_reason?: string | null
          flagged?: boolean | null
          game_category?: string | null
          game_id?: string | null
          hidden?: boolean | null
          id?: string
          is_live?: boolean | null
          livepeer_stream_id?: string | null
          playback_id?: string | null
          playback_url?: string | null
          recording_asset_id?: string | null
          recording_url?: string | null
          started_at?: string | null
          streamer_id: string
          tags?: string[] | null
          thumbnail_url?: string | null
          tip_goal_amount_eth?: number | null
          tip_goal_enabled?: boolean
          tip_goal_title?: string | null
          tip_goal_updated_at?: string
          title: string
          viewer_count?: number | null
        }
        Update: {
          description?: string | null
          ended_at?: string | null
          flag_reason?: string | null
          flagged?: boolean | null
          game_category?: string | null
          game_id?: string | null
          hidden?: boolean | null
          id?: string
          is_live?: boolean | null
          livepeer_stream_id?: string | null
          playback_id?: string | null
          playback_url?: string | null
          recording_asset_id?: string | null
          recording_url?: string | null
          started_at?: string | null
          streamer_id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          tip_goal_amount_eth?: number | null
          tip_goal_enabled?: boolean
          tip_goal_title?: string | null
          tip_goal_updated_at?: string
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          admin_notes: string | null
          created_at: string
          document_type: string
          document_url: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          document_type: string
          document_url: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          document_type?: string
          document_url?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      viewing_history: {
        Row: {
          game_id: string
          id: string
          stream_id: string | null
          user_id: string
          watched_at: string
        }
        Insert: {
          game_id: string
          id?: string
          stream_id?: string | null
          user_id: string
          watched_at?: string
        }
        Update: {
          game_id?: string
          id?: string
          stream_id?: string | null
          user_id?: string
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_history_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewing_history_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_communities: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          is_ens_gated: boolean | null
          is_nft_gated: boolean | null
          member_count: number | null
          name: string | null
          nft_contract_address: string | null
          owner_avatar_url: string | null
          owner_id: string | null
          owner_username: string | null
          owner_verified: boolean | null
          required_ens_suffix: string | null
          rules: string | null
          short_description: string | null
          slug: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          has_base_name: boolean | null
          id: string | null
          username: string | null
          verified_creator: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          has_base_name?: boolean | null
          id?: string | null
          username?: string | null
          verified_creator?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          has_base_name?: boolean | null
          id?: string | null
          username?: string | null
          verified_creator?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_approve_community: {
        Args: { p_community_id: string; p_notes?: string }
        Returns: undefined
      }
      admin_delete_community: {
        Args: { p_community_id: string; p_reason?: string }
        Returns: undefined
      }
      admin_delete_community_post: {
        Args: { p_post_id: string; p_reason?: string }
        Returns: undefined
      }
      admin_delete_message: {
        Args: { p_message_id: string }
        Returns: undefined
      }
      admin_end_stream: { Args: { p_stream_id: string }; Returns: undefined }
      admin_flag_stream: {
        Args: { p_reason: string; p_stream_id: string }
        Returns: undefined
      }
      admin_global_mute: {
        Args: {
          p_duration_hours?: number
          p_reason?: string
          p_user_id: string
        }
        Returns: undefined
      }
      admin_global_unmute: { Args: { p_user_id: string }; Returns: undefined }
      admin_kick_community_member: {
        Args: { p_membership_id: string; p_reason?: string }
        Returns: undefined
      }
      admin_list_users_paged: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          suspended: boolean
          username: string
          verified_creator: boolean
          wallet_address: string
        }[]
      }
      admin_pin_community_post: {
        Args: { p_pinned: boolean; p_post_id: string }
        Returns: undefined
      }
      admin_review_community_report: {
        Args: { p_notes?: string; p_report_id: string; p_status: string }
        Returns: undefined
      }
      admin_review_verification: {
        Args: {
          p_notes?: string
          p_rejection_reason?: string
          p_request_id: string
          p_status: string
        }
        Returns: undefined
      }
      admin_search_users: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          suspended: boolean
          username: string
          verified_creator: boolean
          wallet_address: string
        }[]
      }
      admin_set_stream_hidden: {
        Args: { p_hidden: boolean; p_stream_id: string }
        Returns: undefined
      }
      admin_set_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      admin_suspend_community: {
        Args: { p_community_id: string; p_reason?: string }
        Returns: undefined
      }
      admin_unsuspend_community: {
        Args: { p_community_id: string }
        Returns: undefined
      }
      approve_streamer_application: {
        Args: { p_application_id: string; p_notes?: string }
        Returns: undefined
      }
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
      get_admin_community_stats: { Args: never; Returns: Json }
      get_admin_stats: { Args: never; Returns: Json }
      get_follower_count: { Args: { p_profile_id: string }; Returns: number }
      get_following_count: { Args: { p_profile_id: string }; Returns: number }
      get_my_stream_key: { Args: { p_stream_id: string }; Returns: string }
      get_pending_verifications: {
        Args: never
        Returns: {
          avatar_url: string
          document_count: number
          id: string
          status: string
          submitted_at: string
          user_id: string
          username: string
        }[]
      }
      get_profile_by_wallet: {
        Args: { p_wallet_address: string }
        Returns: string
      }
      get_public_profile_by_wallet: {
        Args: { p_wallet_address: string }
        Returns: string
      }
      get_recent_games: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          game_id: string
          game_name: string
          game_slug: string
          game_thumbnail: string
          last_watched: string
        }[]
      }
      get_stream_tip_total: { Args: { p_stream_id: string }; Returns: number }
      get_user_application_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_wallet_for_tipping: { Args: { p_user_id: string }; Returns: string }
      grant_streamer_role: { Args: { p_user_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_own_profile: { Args: { profile_id: string }; Returns: boolean }
      is_profile_complete: { Args: { p_user_id: string }; Returns: boolean }
      is_streamer: { Args: { p_user_id: string }; Returns: boolean }
      is_user_blocked_from_stream: {
        Args: { p_stream_id: string; p_user_id: string }
        Returns: boolean
      }
      is_wallet_lookup_context: { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_metadata?: Json
          p_target_id: string
          p_target_type: string
        }
        Returns: undefined
      }
      reject_streamer_application: {
        Args: { p_application_id: string; p_notes?: string }
        Returns: undefined
      }
      set_user_verified: {
        Args: { p_user_id: string; p_verified: boolean }
        Returns: undefined
      }
      store_stream_key: {
        Args: { p_stream_id: string; p_stream_key: string }
        Returns: undefined
      }
      suspend_user: {
        Args: { p_reason?: string; p_user_id: string }
        Returns: undefined
      }
      unsuspend_user: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "viewer" | "streamer" | "admin"
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
    Enums: {
      app_role: ["viewer", "streamer", "admin"],
    },
  },
} as const
