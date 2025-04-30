import { getTodayQuestion } from '@/app/actions/questions'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const question = await getTodayQuestion()
    
    if (!question) {
      return NextResponse.json(
        { error: 'No question found for today' },
        { status: 404 }
      )
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error in /api/questions/today:', error)
    return NextResponse.json(
      { error: 'Failed to fetch today\'s question' },
      { status: 500 }
    )
  }
} 