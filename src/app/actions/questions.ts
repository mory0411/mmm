'use server'

import { createServerClient } from '@/lib/supabase/server'
import { Question } from '@/database/types'

export async function getTodayQuestion(): Promise<Question | null> {
  const supabase = createServerClient()
  
  // Get today's question based on the current date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching today\'s question:', error)
    return null
  }

  return data
} 