'use server'

import { createServerClient } from '@/lib/supabase/server'
import { Answer, Role } from '@/database/types'
import { getRelationshipByHash } from './relationships'
import { getTodayQuestion } from './questions'

interface SubmitAnswerParams {
  relationship_hash: string
  role: Role
  answer_text: string
}

export async function submitAnswer({
  relationship_hash,
  role,
  answer_text
}: SubmitAnswerParams): Promise<{ data: Answer | null; error: string | null }> {
  const supabase = createServerClient()
  
  try {
    // 1. Get relationship by hash
    const relationship = await getRelationshipByHash(relationship_hash)
    if (!relationship) {
      return { data: null, error: 'Relationship not found' }
    }

    // 2. Get today's question
    const question = await getTodayQuestion()
    if (!question) {
      return { data: null, error: 'No question found for today' }
    }

    // 3. Check if an answer already exists for this role
    const { data: existingAnswer, error: existingError } = await supabase
      .from('answers')
      .select('*')
      .eq('relationship_id', relationship.id)
      .eq('question_id', question.id)
      .eq('role', role)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing answer:', existingError)
      return { data: null, error: 'Error checking existing answer' }
    }

    if (existingAnswer) {
      return { data: null, error: 'Answer already exists for this role' }
    }

    // 4. Submit the answer
    const { data, error } = await supabase
      .from('answers')
      .insert([{
        relationship_id: relationship.id,
        question_id: question.id,
        answer_text,
        role
      }])
      .select()
      .single()

    if (error) {
      console.error('Error submitting answer:', error)
      return { data: null, error: `Error submitting answer: ${error.message}` }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in submitAnswer:', error)
    return { data: null, error: 'Unexpected error occurred' }
  }
} 