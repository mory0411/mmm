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
  role: 'authenticated' | 'anon';
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface TablePolicies {
  relationships: Policy[];
  questions: Policy[];
  answers: Policy[];
} 