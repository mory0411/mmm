'use server'

import { createServerClient } from '@/lib/supabase/server'
import { Relationship } from '@/database/types'
import crypto from 'crypto'

export async function createRelationship(): Promise<Relationship | null> {
  const supabase = createServerClient()
  
  try {
    // Generate a unique hash code
    const hash_code = crypto.randomBytes(16).toString('hex')
    
    // Create a new relationship with the hash code
    const { data, error } = await supabase
      .from('relationships')
      .insert([{ hash_code }])
      .select()
      .single()

    if (error) {
      console.error('Error creating relationship:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createRelationship:', error)
    return null
  }
} 