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
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string
          flag: string
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          name_en: string
          online_count: number | null
          price: number
          region: string
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string
          flag: string
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          name_en: string
          online_count?: number | null
          price?: number
          region: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          flag?: string
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          name_en?: string
          online_count?: number | null
          price?: number
          region?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      country_services: {
        Row: {
          country_id: string
          created_at: string
          id: string
          is_active: boolean | null
          price: number
          service_id: string
        }
        Insert: {
          country_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          price?: number
          service_id: string
        }
        Update: {
          country_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          price?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "country_services_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          country_id: string
          created_at: string
          expires_at: string | null
          id: string
          phone_number: string
          price: number
          service_id: string
          status: string | null
          user_id: string
          verification_code: string | null
        }
        Insert: {
          completed_at?: string | null
          country_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          phone_number: string
          price: number
          service_id: string
          status?: string | null
          user_id: string
          verification_code?: string | null
        }
        Update: {
          completed_at?: string | null
          country_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          phone_number?: string
          price?: number
          service_id?: string
          status?: string | null
          user_id?: string
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          country_code: string
          created_at: string
          id: string
          is_available: boolean | null
          locked_by: string | null
          locked_until: string | null
          phone_number: string
        }
        Insert: {
          country_code: string
          created_at?: string
          id?: string
          is_available?: boolean | null
          locked_by?: string | null
          locked_until?: string | null
          phone_number: string
        }
        Update: {
          country_code?: string
          created_at?: string
          id?: string
          is_available?: boolean | null
          locked_by?: string | null
          locked_until?: string | null
          phone_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          name_en: string | null
          price_modifier: number
          sort_order: number | null
          success_rate: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          name_en?: string | null
          price_modifier?: number
          sort_order?: number | null
          success_rate?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          name_en?: string | null
          price_modifier?: number
          sort_order?: number | null
          success_rate?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          order_id: string
          payment_method: string | null
          status: string | null
          tx_hash: string | null
          type: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          order_id: string
          payment_method?: string | null
          status?: string | null
          tx_hash?: string | null
          type: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          order_id?: string
          payment_method?: string | null
          status?: string | null
          tx_hash?: string | null
          type?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      wallet_blacklist: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          reason: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
