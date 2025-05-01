import { submitAnswer } from '@/app/actions/answers'
import { Role } from '@/database/types'
import { NextResponse } from 'next/server'

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