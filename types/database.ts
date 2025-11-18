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
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'contractor' | 'resident'
          estate_id: string | null
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          role: 'admin' | 'contractor' | 'resident'
          estate_id?: string | null
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'contractor' | 'resident'
          estate_id?: string | null
          full_name?: string | null
          created_at?: string
        }
      }
      estates: {
        Row: {
          id: string
          name: string
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          created_at?: string
        }
      }
      contractor_estates: {
        Row: {
          contractor_id: string
          estate_id: string
        }
        Insert: {
          contractor_id: string
          estate_id: string
        }
        Update: {
          contractor_id?: string
          estate_id?: string
        }
      }
      reviews: {
        Row: {
          id: string
          contractor_id: string
          resident_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contractor_id: string
          resident_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contractor_id?: string
          resident_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
  }
}

