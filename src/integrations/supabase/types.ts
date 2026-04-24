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
      automation_rules: {
        Row: {
          action_description: string
          created_at: string
          enabled: boolean | null
          id: string
          last_triggered: string | null
          name: string
          trigger_condition: string
        }
        Insert: {
          action_description: string
          created_at?: string
          enabled?: boolean | null
          id?: string
          last_triggered?: string | null
          name: string
          trigger_condition: string
        }
        Update: {
          action_description?: string
          created_at?: string
          enabled?: boolean | null
          id?: string
          last_triggered?: string | null
          name?: string
          trigger_condition?: string
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          ai_summary: string | null
          case_id: string | null
          client_name: string | null
          created_at: string
          department: string | null
          duration_seconds: number | null
          fields_resolved: string[] | null
          id: string
          notes: string | null
          phone_number: string
          plan_number: string | null
          provider_name: string
          status: string
          transcript: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          case_id?: string | null
          client_name?: string | null
          created_at?: string
          department?: string | null
          duration_seconds?: number | null
          fields_resolved?: string[] | null
          id?: string
          notes?: string | null
          phone_number: string
          plan_number?: string | null
          provider_name: string
          status?: string
          transcript?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          case_id?: string | null
          client_name?: string | null
          created_at?: string
          department?: string | null
          duration_seconds?: number | null
          fields_resolved?: string[] | null
          id?: string
          notes?: string | null
          phone_number?: string
          plan_number?: string | null
          provider_name?: string
          status?: string
          transcript?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          ai_extraction_date: string | null
          assigned_role: string | null
          case_notes: string | null
          case_ref: string
          ceding_complete_date: string | null
          client_name: string
          confidence_score: number | null
          created_at: string
          current_stage: number
          current_value: string | null
          id: string
          is_overdue: boolean | null
          last_activity_at: string
          loa_method: string | null
          loa_notes: string | null
          loa_sent_date: string | null
          loa_status: string
          loa_tracking_ref: string | null
          missing_fields_count: number | null
          owner_id: string | null
          owner_name: string | null
          pdf_expected_date: string | null
          pdf_received_date: string | null
          plan_number: string
          plan_ref: string | null
          plan_type: string
          processing_expected: string | null
          provider_id: string | null
          provider_name: string
          rag: string
          sr_prepared_at: string | null
          stages_completed: number[]
          status: string
          transfer_value: string | null
          updated_at: string
          zoho_ceding_status: string
          zoho_synced_at: string | null
          zoho_task_id: string | null
        }
        Insert: {
          ai_extraction_date?: string | null
          assigned_role?: string | null
          case_notes?: string | null
          case_ref: string
          ceding_complete_date?: string | null
          client_name: string
          confidence_score?: number | null
          created_at?: string
          current_stage?: number
          current_value?: string | null
          id?: string
          is_overdue?: boolean | null
          last_activity_at?: string
          loa_method?: string | null
          loa_notes?: string | null
          loa_sent_date?: string | null
          loa_status?: string
          loa_tracking_ref?: string | null
          missing_fields_count?: number | null
          owner_id?: string | null
          owner_name?: string | null
          pdf_expected_date?: string | null
          pdf_received_date?: string | null
          plan_number: string
          plan_ref?: string | null
          plan_type?: string
          processing_expected?: string | null
          provider_id?: string | null
          provider_name: string
          rag?: string
          sr_prepared_at?: string | null
          stages_completed?: number[]
          status?: string
          transfer_value?: string | null
          updated_at?: string
          zoho_ceding_status?: string
          zoho_synced_at?: string | null
          zoho_task_id?: string | null
        }
        Update: {
          ai_extraction_date?: string | null
          assigned_role?: string | null
          case_notes?: string | null
          case_ref?: string
          ceding_complete_date?: string | null
          client_name?: string
          confidence_score?: number | null
          created_at?: string
          current_stage?: number
          current_value?: string | null
          id?: string
          is_overdue?: boolean | null
          last_activity_at?: string
          loa_method?: string | null
          loa_notes?: string | null
          loa_sent_date?: string | null
          loa_status?: string
          loa_tracking_ref?: string | null
          missing_fields_count?: number | null
          owner_id?: string | null
          owner_name?: string | null
          pdf_expected_date?: string | null
          pdf_received_date?: string | null
          plan_number?: string
          plan_ref?: string | null
          plan_type?: string
          processing_expected?: string | null
          provider_id?: string | null
          provider_name?: string
          rag?: string
          sr_prepared_at?: string | null
          stages_completed?: number[]
          status?: string
          transfer_value?: string | null
          updated_at?: string
          zoho_ceding_status?: string
          zoho_synced_at?: string | null
          zoho_task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_fields: {
        Row: {
          case_id: string
          confidence: string | null
          created_at: string
          evidence_ref: string | null
          evidence_source: string | null
          extracted_at: string | null
          field_key: string | null
          id: string
          label: string
          manually_edited: boolean
          notes: string | null
          reviewed_by: string | null
          section: string
          source_page: number | null
          status: string
          updated_at: string
          value: string | null
        }
        Insert: {
          case_id: string
          confidence?: string | null
          created_at?: string
          evidence_ref?: string | null
          evidence_source?: string | null
          extracted_at?: string | null
          field_key?: string | null
          id?: string
          label: string
          manually_edited?: boolean
          notes?: string | null
          reviewed_by?: string | null
          section: string
          source_page?: number | null
          status?: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          case_id?: string
          confidence?: string | null
          created_at?: string
          evidence_ref?: string | null
          evidence_source?: string | null
          extracted_at?: string | null
          field_key?: string | null
          id?: string
          label?: string
          manually_edited?: boolean
          notes?: string | null
          reviewed_by?: string | null
          section?: string
          source_page?: number | null
          status?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_fields_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          avg_confidence: number | null
          case_id: string | null
          created_at: string
          document_type: string | null
          extracted_data: Json | null
          extraction_error: string | null
          extraction_status: string
          fields_extracted: number | null
          file_name: string
          file_path: string | null
          id: string
          provider_name: string | null
          status: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          avg_confidence?: number | null
          case_id?: string | null
          created_at?: string
          document_type?: string | null
          extracted_data?: Json | null
          extraction_error?: string | null
          extraction_status?: string
          fields_extracted?: number | null
          file_name: string
          file_path?: string | null
          id?: string
          provider_name?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          avg_confidence?: number | null
          case_id?: string | null
          created_at?: string
          document_type?: string | null
          extracted_data?: Json | null
          extraction_error?: string | null
          extraction_status?: string
          fields_extracted?: number | null
          file_name?: string
          file_path?: string | null
          id?: string
          provider_name?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      field_audit: {
        Row: {
          action: string
          actor_name: string | null
          actor_role: string | null
          case_id: string
          confidence: string | null
          created_at: string
          field_key: string | null
          field_label: string | null
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          source: string
        }
        Insert: {
          action: string
          actor_name?: string | null
          actor_role?: string | null
          case_id: string
          confidence?: string | null
          created_at?: string
          field_key?: string | null
          field_label?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          source?: string
        }
        Update: {
          action?: string
          actor_name?: string | null
          actor_role?: string | null
          case_id?: string
          confidence?: string | null
          created_at?: string
          field_key?: string | null
          field_label?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          source?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_name: string | null
          actor_role: string | null
          body: string | null
          case_id: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          read_at: string | null
          recipient_role: string | null
          recipient_user_id: string
          title: string
          type: string
        }
        Insert: {
          actor_name?: string | null
          actor_role?: string | null
          body?: string | null
          case_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          read_at?: string | null
          recipient_role?: string | null
          recipient_user_id: string
          title: string
          type: string
        }
        Update: {
          actor_name?: string | null
          actor_role?: string | null
          body?: string | null
          case_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          read_at?: string | null
          recipient_role?: string | null
          recipient_user_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          aliases: string[] | null
          avg_turnaround: number | null
          created_at: string
          email: string | null
          id: string
          jargon_map: Json | null
          last_verified: string | null
          name: string
          origo_supported: boolean | null
          phone: string | null
          portal_url: string | null
          routing_rules: Json | null
          updated_at: string
        }
        Insert: {
          aliases?: string[] | null
          avg_turnaround?: number | null
          created_at?: string
          email?: string | null
          id?: string
          jargon_map?: Json | null
          last_verified?: string | null
          name: string
          origo_supported?: boolean | null
          phone?: string | null
          portal_url?: string | null
          routing_rules?: Json | null
          updated_at?: string
        }
        Update: {
          aliases?: string[] | null
          avg_turnaround?: number | null
          created_at?: string
          email?: string | null
          id?: string
          jargon_map?: Json | null
          last_verified?: string | null
          name?: string
          origo_supported?: boolean | null
          phone?: string | null
          portal_url?: string | null
          routing_rules?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_name: string | null
          assigned_to: string | null
          case_id: string
          client_name: string | null
          completed: boolean | null
          created_at: string
          due_date: string | null
          id: string
          provider_name: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_name?: string | null
          assigned_to?: string | null
          case_id: string
          client_name?: string | null
          completed?: boolean | null
          created_at?: string
          due_date?: string | null
          id?: string
          provider_name?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_name?: string | null
          assigned_to?: string | null
          case_id?: string
          client_name?: string | null
          completed?: boolean | null
          created_at?: string
          due_date?: string | null
          id?: string
          provider_name?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
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
