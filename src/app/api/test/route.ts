import { supabase } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Relationships 테이블 조회
    const { data: relationships, error: relationshipsError } = await supabase
      .from('relationships')
      .select('*')

    if (relationshipsError) throw relationshipsError

    // Questions 테이블 조회
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')

    if (questionsError) throw questionsError

    // Answers 테이블 조회
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('*')

    if (answersError) throw answersError

    return NextResponse.json({
      relationships,
      questions,
      answers
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
} 