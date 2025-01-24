export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tickets: {
        Row: {
          id: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high'
          created_at: string
          created_by: string
          status: 'open' | 'in_progress' | 'closed'
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          created_by?: string
          status?: 'open' | 'in_progress' | 'closed'
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          created_by?: string
          status?: 'open' | 'in_progress' | 'closed'
          updated_at?: string
        }
      }
      ticket_assignments: {
        Row: {
          id: string
          ticket_id: string
          assigned_to: string
          assigned_by: string
          assigned_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          assigned_to: string
          assigned_by: string
          assigned_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          assigned_to?: string
          assigned_by?: string
          assigned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_ticket: {
        Args: {
          _ticket_id: string
          _assigned_to: string
        }
        Returns: {
          id: string
          ticket_id: string
          assigned_to: string
          assigned_by: string
          assigned_at: string
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
