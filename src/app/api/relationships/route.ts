import { createRelationship } from '@/app/actions/relationships'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const relationship = await createRelationship()
    
    if (!relationship) {
      return NextResponse.json(
        { error: 'Failed to create relationship' },
        { status: 500 }
      )
    }

    return NextResponse.json(relationship)
  } catch (error) {
    console.error('Error in /api/relationships:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 