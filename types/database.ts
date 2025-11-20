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
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'contractor' | 'resident'
          estate_id: string | null
          full_name: string | null
          surname: string | null
          contact_details: string | null
          stand_number: string | null
          created_at: string
        }
        Insert: {
          id: string
          role: 'admin' | 'contractor' | 'resident'
          estate_id?: string | null
          full_name?: string | null
          surname?: string | null
          contact_details?: string | null
          stand_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'contractor' | 'resident'
          estate_id?: string | null
          full_name?: string | null
          surname?: string | null
          contact_details?: string | null
          stand_number?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          group_name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          group_name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          group_name?: string
          created_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          name: string
          category_id: string | null
          contact_details: string | null
          status: 'active' | 'inactive' | 'pending' | 'defunct'
          upvotes: number
          downvotes: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id?: string | null
          contact_details?: string | null
          status?: 'active' | 'inactive' | 'pending' | 'defunct'
          upvotes?: number
          downvotes?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string | null
          contact_details?: string | null
          status?: 'active' | 'inactive' | 'pending' | 'defunct'
          upvotes?: number
          downvotes?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      supplier_votes: {
        Row: {
          id: string
          supplier_id: string
          user_id: string
          vote_direction: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          user_id: string
          vote_direction: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          user_id?: string
          vote_direction?: 'up' | 'down'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_votes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reports: {
        Row: {
          id: string
          user_id: string
          supplier_id: string | null
          description: string
          type: 'snag' | 'suggestion' | 'incorrect_details' | 'recommendation_request'
          status: 'open' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          supplier_id?: string | null
          description: string
          type: 'snag' | 'suggestion' | 'incorrect_details' | 'recommendation_request'
          status?: 'open' | 'resolved'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          supplier_id?: string | null
          description?: string
          type?: 'snag' | 'suggestion' | 'incorrect_details' | 'recommendation_request'
          status?: 'open' | 'resolved'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "contractor_estates_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_estates_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "reviews_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
