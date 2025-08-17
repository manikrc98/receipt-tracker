import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          ai_api_key: string | null
          ai_provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          ai_api_key?: string | null
          ai_provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          ai_api_key?: string | null
          ai_provider?: string
          created_at?: string
          updated_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          user_id: string
          filename: string
          original_filename: string
          file_path: string
          total_amount: number | null
          store_name: string | null
          transaction_date: string | null
          processed_at: string
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          original_filename: string
          file_path: string
          total_amount?: number | null
          store_name?: string | null
          transaction_date?: string | null
          processed_at?: string
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          original_filename?: string
          file_path?: string
          total_amount?: number | null
          store_name?: string | null
          transaction_date?: string | null
          processed_at?: string
          status?: string
        }
      }
      transactions: {
        Row: {
          id: string
          receipt_id: string
          item_name: string
          quantity: number
          unit_price: number | null
          total_price: number
          category: string | null
          subcategory: string | null
          confidence_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          receipt_id: string
          item_name: string
          quantity?: number
          unit_price?: number | null
          total_price: number
          category?: string | null
          subcategory?: string | null
          confidence_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          receipt_id?: string
          item_name?: string
          quantity?: number
          unit_price?: number | null
          total_price?: number
          category?: string | null
          subcategory?: string | null
          confidence_score?: number | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
    }
  }
}
