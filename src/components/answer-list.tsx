"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Answer {
  id: string;
  answer_text: string;
  role: "parent" | "child";
  created_at: string;
  questions: {
    id: string;
    text: string;
  };
}

interface AnswerListProps {
  hash: string;
}

export function AnswerList({ hash }: AnswerListProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnswers() {
      try {
        const response = await fetch(`/api/answers?hash=${hash}`);
        if (!response.ok) throw new Error("Failed to fetch answers");
        const data = await response.json();
        setAnswers(data);
      } catch (error) {
        console.error("Error fetching answers:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnswers();
  }, [hash]);

  if (isLoading) {
    return <div className="text-center py-4">답변을 불러오는 중...</div>;
  }

  if (answers.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">아직 답변이 없습니다.</div>;
  }

  return (
    <div className="space-y-4">
      {answers.map((answer) => (
        <Card key={answer.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {answer.role === "parent" ? "부모" : "자녀"}의 답변
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {format(new Date(answer.created_at), "PPP", { locale: ko })}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{answer.answer_text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 