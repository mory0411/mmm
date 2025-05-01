import { supabase } from '@/lib/supabase'

async function verifySchema() {
  try {
    // 1. Test relationship creation
    const { data: relationship, error: relationshipError } = await supabase
      .from('relationships')
      .insert([{ hash_code: 'test_hash' }])
      .select()
      .single()

    if (relationshipError) {
      console.error('❌ Relationship creation failed:', relationshipError)
      return false
    }
    console.log('✅ Relationship creation successful')

    // 2. Test question retrieval
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select()
      .limit(1)
      .single()

    if (questionError) {
      console.error('❌ Question retrieval failed:', questionError)
      return false
    }
    console.log('✅ Question retrieval successful')

    // 3. Test answer creation
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .insert([{
        relationship_id: relationship.id,
        question_id: question.id,
        answer_text: 'Test answer',
        role: 'child'
      }])
      .select()
      .single()

    if (answerError) {
      console.error('❌ Answer creation failed:', answerError)
      return false
    }
    console.log('✅ Answer creation successful')

    // 4. Test answer retrieval
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select()
      .eq('relationship_id', relationship.id)

    if (answersError) {
      console.error('❌ Answer retrieval failed:', answersError)
      return false
    }
    console.log('✅ Answer retrieval successful')

    // Cleanup
    await supabase.from('answers').delete().eq('id', answer.id)
    await supabase.from('relationships').delete().eq('id', relationship.id)

    return true
  } catch (error) {
    console.error('❌ Verification failed:', error)
    return false
  }
}

// Run verification
verifySchema().then((success) => {
  if (success) {
    console.log('🎉 All verifications passed!')
  } else {
    console.error('❌ Some verifications failed')
  }
}) 