export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          author_id: string | null
          confidence_score: number
          content: string
          created_at: string
          featured_image: string | null
          id: string
          original_claim: string
          published_at: string | null
          share_count: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          verification_status: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          confidence_score: number
          content: string
          created_at?: string
          featured_image?: string | null
          id?: string
          original_claim: string
          published_at?: string | null
          share_count?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          verification_status: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          confidence_score?: number
          content?: string
          created_at?: string
          featured_image?: string | null
          id?: string
          original_claim?: string
          published_at?: string | null
          share_count?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          verification_status?: string
          view_count?: number | null
        }
        Relationships: []
      }
      expert_validations: {
        Row: {
          article_id: string | null
          comments: string | null
          created_at: string
          expert_id: string | null
          id: string
          validation_status: string | null
        }
        Insert: {
          article_id?: string | null
          comments?: string | null
          created_at?: string
          expert_id?: string | null
          id?: string
          validation_status?: string | null
        }
        Update: {
          article_id?: string | null
          comments?: string | null
          created_at?: string
          expert_id?: string | null
          id?: string
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_validations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_validations_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      experts: {
        Row: {
          created_at: string
          credentials: string | null
          expertise_areas: string[]
          id: string
          name: string
          reputation_score: number | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          credentials?: string | null
          expertise_areas: string[]
          id?: string
          name: string
          reputation_score?: number | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          credentials?: string | null
          expertise_areas?: string[]
          id?: string
          name?: string
          reputation_score?: number | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      monitored_content: {
        Row: {
          content: string
          detected_at: string
          id: string
          platform: string | null
          priority_score: number | null
          source_url: string | null
          status: string | null
          viral_potential: number | null
        }
        Insert: {
          content: string
          detected_at?: string
          id?: string
          platform?: string | null
          priority_score?: number | null
          source_url?: string | null
          status?: string | null
          viral_potential?: number | null
        }
        Update: {
          content?: string
          detected_at?: string
          id?: string
          platform?: string | null
          priority_score?: number | null
          source_url?: string | null
          status?: string | null
          viral_potential?: number | null
        }
        Relationships: []
      }
      research_analyses: {
        Row: {
          ai_analysis: string
          article_id: string | null
          created_at: string
          id: string
          original_content: string
          processing_time: number | null
          research_data: Json
          sources_found: number | null
        }
        Insert: {
          ai_analysis: string
          article_id?: string | null
          created_at?: string
          id?: string
          original_content: string
          processing_time?: number | null
          research_data: Json
          sources_found?: number | null
        }
        Update: {
          ai_analysis?: string
          article_id?: string | null
          created_at?: string
          id?: string
          original_content?: string
          processing_time?: number | null
          research_data?: Json
          sources_found?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "research_analyses_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          article_id: string | null
          created_at: string
          credibility_score: number | null
          description: string | null
          id: string
          source_type: string | null
          title: string
          url: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          credibility_score?: number | null
          description?: string | null
          id?: string
          source_type?: string | null
          title: string
          url: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          credibility_score?: number | null
          description?: string | null
          id?: string
          source_type?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_slug: {
        Args: { title_text: string }
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
