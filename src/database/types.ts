export type Role = 'child' | 'parent';

export interface Relationship {
  id: string;
  hash_code: string;
  created_at: string;
}

export interface Question {
  id: string;
  text: string;
  created_at: string;
}

export interface Answer {
  id: string;
  relationship_id: string;
  question_id: string;
  answer_text: string;
  role: Role;
  created_at: string;
}

export interface Policy {
  role: 'public';
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface TablePolicies {
  relationships: Policy[];
  questions: Policy[];
  answers: Policy[];
}

// MVP에서는 모든 테이블에 대해 공개 접근 허용
export const tablePolicies: TablePolicies = {
  relationships: [
    { role: 'public', action: 'SELECT' },
    { role: 'public', action: 'INSERT' }
  ],
  questions: [
    { role: 'public', action: 'SELECT' }
  ],
  answers: [
    { role: 'public', action: 'SELECT' },
    { role: 'public', action: 'INSERT' }
  ]
}

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
          created_at: string
          email: string
          name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
        }
      }
      answers: {
        Row: {
          id: string
          created_at: string
          user_id: string
          question_id: string
          content: string
          role: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          question_id: string
          content: string
          role: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          question_id?: string
          content?: string
          role?: string
        }
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
  }
} 