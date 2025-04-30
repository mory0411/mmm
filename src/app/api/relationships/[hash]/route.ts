import { getRelationshipByHash } from '@/app/actions/relationships'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { hash: string } }
) {
  try {
    const relationship = await getRelationshipByHash(params.hash)
    
    if (!relationship) {
      return NextResponse.json(
        { error: 'Relationship not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(relationship)
  } catch (error) {
    console.error('Error in /api/relationships/[hash]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 