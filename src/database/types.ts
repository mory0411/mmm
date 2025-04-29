export type Role = 'child' | 'parent';

export interface Relationship {
  id: string;
  created_at: string;
}

export interface Question {
  id: string;
  text: string;
  category?: string;
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

export interface ShareLink {
  id: string;
  relationship_id: string;
  hash_code: string;
  created_at: string;
} 