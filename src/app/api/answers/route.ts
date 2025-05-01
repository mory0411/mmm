import { submitAnswer } from '@/app/actions/answers'
import { Role } from '@/database/types'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hash = searchParams.get('hash')

    if (!hash) {
      return NextResponse.json(
        { error: 'Hash parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // 1. Get relationship by hash
    const { data: relationship, error: relationshipError } = await supabase
      .from('relationships')
      .select('id')
      .eq('hash_code', hash)
      .single()

    if (relationshipError) {
      return NextResponse.json(
        { error: 'Relationship not found' },
        { status: 404 }
      )
    }

    // 2. Get answers for this relationship
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select(`
        id,
        answer_text,
        role,
        created_at,
        questions (
          id,
          text
        )
      `)
      .eq('relationship_id', relationship.id)
      .order('created_at', { ascending: false })

    if (answersError) {
      return NextResponse.json(
        { error: 'Failed to fetch answers' },
        { status: 500 }
      )
    }

    return NextResponse.json(answers)
  } catch (error) {
    console.error('Error in GET /api/answers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { relationship_hash, role, answer_text } = body

    // Validate input
    if (!relationship_hash || !role || !answer_text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    if (role !== 'child' && role !== 'parent') {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Validate answer length
    if (answer_text.length > 500) {
      return NextResponse.json(
        { error: 'Answer text exceeds 500 characters' },
        { status: 400 }
      )
    }

    const { data, error } = await submitAnswer({
      relationship_hash,
      role: role as Role,
      answer_text
    })

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in /api/answers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 