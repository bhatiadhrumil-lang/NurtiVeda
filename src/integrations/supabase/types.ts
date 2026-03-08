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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      dosha_results: {
        Row: {
          answers: Json | null
          created_at: string
          id: string
          kapha_score: number
          pitta_score: number
          primary_dosha: string
          secondary_dosha: string | null
          user_id: string
          vata_score: number
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          id?: string
          kapha_score?: number
          pitta_score?: number
          primary_dosha: string
          secondary_dosha?: string | null
          user_id: string
          vata_score?: number
        }
        Update: {
          answers?: Json | null
          created_at?: string
          id?: string
          kapha_score?: number
          pitta_score?: number
          primary_dosha?: string
          secondary_dosha?: string | null
          user_id?: string
          vata_score?: number
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          fat: number
          fiber: number
          food_items: Json
          id: string
          logged_at: string
          meal_name: string
          meal_type: string
          notes: string | null
          protein: number
          user_id: string | null
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          fiber?: number
          food_items?: Json
          id?: string
          logged_at?: string
          meal_name: string
          meal_type?: string
          notes?: string | null
          protein?: number
          user_id?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          fiber?: number
          food_items?: Json
          id?: string
          logged_at?: string
          meal_name?: string
          meal_type?: string
          notes?: string | null
          protein?: number
          user_id?: string | null
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          carbs_ratio: number
          created_at: string
          daily_calories: number
          description: string | null
          diet_type: string
          fat_ratio: number
          foods: Json | null
          goal: string
          id: string
          meals_per_day: number
          name: string
          protein_ratio: number
          sample_meals: Json | null
          substitutions: Json | null
          tips: string[] | null
        }
        Insert: {
          carbs_ratio?: number
          created_at?: string
          daily_calories: number
          description?: string | null
          diet_type: string
          fat_ratio?: number
          foods?: Json | null
          goal: string
          id?: string
          meals_per_day?: number
          name: string
          protein_ratio?: number
          sample_meals?: Json | null
          substitutions?: Json | null
          tips?: string[] | null
        }
        Update: {
          carbs_ratio?: number
          created_at?: string
          daily_calories?: number
          description?: string | null
          diet_type?: string
          fat_ratio?: number
          foods?: Json | null
          goal?: string
          id?: string
          meals_per_day?: number
          name?: string
          protein_ratio?: number
          sample_meals?: Json | null
          substitutions?: Json | null
          tips?: string[] | null
        }
        Relationships: []
      }
      meal_reminders: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          meal_type: string
          reminder_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          meal_type: string
          reminder_time: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          meal_type?: string
          reminder_time?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          height: number | null
          id: string
          profile_completed: boolean
          username: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id: string
          profile_completed?: boolean
          username: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          profile_completed?: boolean
          username?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_meal_plans: {
        Row: {
          carbs_grams: number
          created_at: string
          daily_calorie_target: number
          fat_grams: number
          id: string
          is_active: boolean
          meal_plan_id: string
          progress_notes: string[] | null
          protein_grams: number
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          carbs_grams: number
          created_at?: string
          daily_calorie_target: number
          fat_grams: number
          id?: string
          is_active?: boolean
          meal_plan_id: string
          progress_notes?: string[] | null
          protein_grams: number
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          carbs_grams?: number
          created_at?: string
          daily_calorie_target?: number
          fat_grams?: number
          id?: string
          is_active?: boolean
          meal_plan_id?: string
          progress_notes?: string[] | null
          protein_grams?: number
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_meal_plans_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
