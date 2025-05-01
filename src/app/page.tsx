'use client'

import { useEffect, useState } from 'react'
import { RoleSelector } from "@/components/role-selector";
import { AnswerForm } from '@/components/answer-form';
import { AnswerList } from '@/components/answer-list';

interface Question {
  id: string;
  text: string;
}

export default function Home() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [relationshipHash, setRelationshipHash] = useState<string | null>(null);

  useEffect(() => {
    // 오늘의 질문 가져오기
    fetch('/api/questions/today')
      .then(res => res.json())
      .then(data => setQuestion(data))
      .catch(console.error);

    // URL에서 해시 코드 가져오기
    const hash = new URLSearchParams(window.location.search).get('hash');
    setRelationshipHash(hash);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-2xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">오늘의 대화</h1>
        <RoleSelector />
        {question && relationshipHash && (
          <div className="space-y-8">
            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">오늘의 질문</h2>
              <p className="text-lg">{question.text}</p>
            </div>
            <AnswerForm 
              questionId={question.id} 
              relationshipHash={relationshipHash} 
            />
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">답변 목록</h2>
              <AnswerList hash={relationshipHash} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
