"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function RelationshipDetailPage() {
  const { hash } = useParams();
  const [question, setQuestion] = useState<any>(null);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [relationshipInfo, setRelationshipInfo] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myAnswer, setMyAnswer] = useState<any>(null);
  const [myTodayAnswer, setMyTodayAnswer] = useState<any>(null);

  useEffect(() => {
    const fetchTodayQuestion = async () => {
      setLoading(true);
      // 1. hash_code로 relationship_id, parent_user_id, child_user_id 조회
      const { data: relationship } = await supabase
        .from("relationships")
        .select("id, parent_user_id, child_user_id")
        .eq("hash_code", hash)
        .single();

      if (!relationship) {
        setQuestion(null);
        setRelationshipId(null);
        setRelationshipInfo(null);
        setLoading(false);
        return;
      }
      setRelationshipId(relationship.id);
      setRelationshipInfo(relationship);

      // 2. 오늘의 질문 조회
      const { data: qh } = await supabase
        .from("question_history")
        .select("*, questions(text)")
        .eq("relationship_id", relationship.id)
        .in("status", ["today", "1-reply", "2-reply"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setQuestion(qh);
      setLoading(false);
    };

    fetchTodayQuestion();
  }, [hash]);

  useEffect(() => {
    // 내 답변 여부 확인
    const fetchMyAnswer = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !relationshipId || !question) return;
      const { data: answer } = await supabase
        .from("answers")
        .select("*")
        .eq("relationship_id", relationshipId)
        .eq("question_id", question.question_id)
        .eq("user_id", user.id)
        .single();
      setMyAnswer(answer);
    };
    if (relationshipId && question) fetchMyAnswer();
  }, [relationshipId, question]);

  useEffect(() => {
    // 오늘의 질문에 대한 내 답변 불러오기
    const fetchMyTodayAnswer = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !relationshipId || !question) return;
      const { data: answer } = await supabase
        .from("answers")
        .select("*")
        .eq("relationship_id", relationshipId)
        .eq("question_id", question.question_id)
        .eq("user_id", user.id)
        .single();
      setMyTodayAnswer(answer);
    };
    if (relationshipId && question) fetchMyTodayAnswer();
  }, [relationshipId, question, submitting]);

  const handleSubmit = async () => {
    if (!answer.trim() || !relationshipId || !question) return;
    setSubmitting(true);

    // 현재 로그인한 사용자 정보
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("로그인이 필요합니다.");
      setSubmitting(false);
      return;
    }

    // 내 역할 판단
    let myRole = "";
    if (relationshipInfo?.parent_user_id === user.id) myRole = "parent";
    if (relationshipInfo?.child_user_id === user.id) myRole = "child";

    if (!myRole) {
      alert("이 관계에 참여한 사용자가 아닙니다.");
      setSubmitting(false);
      return;
    }

    // 답변 저장
    const { error } = await supabase
      .from("answers")
      .insert({
        relationship_id: relationshipId,
        question_id: question.question_id,
        user_id: user.id,
        answer_text: answer.trim(),
        role: myRole
      });

    if (error) {
      alert("답변 저장 실패: " + error.message);
      setSubmitting(false);
      return;
    }

    // 답변 개수 확인 후 status 업데이트
    const { count } = await supabase
      .from("answers")
      .select("id", { count: "exact", head: true })
      .eq("relationship_id", relationshipId)
      .eq("question_id", question.question_id);

    let newStatus = "1-reply";
    if ((count ?? 0) >= 2) newStatus = "2-reply";

    await supabase
      .from("question_history")
      .update({ status: newStatus })
      .eq("relationship_id", relationshipId)
      .eq("question_id", question.question_id);

    setAnswer("");
    alert("답변이 저장되었습니다!");
    setSubmitting(false);
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex justify-end mb-4">
        <Link href={`/r/${hash}/history`}>
          <Button variant="outline" size="sm">과거 질문-답변 보기</Button>
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">오늘의 질문</h1>
      {loading ? (
        <div className="text-gray-400">로딩 중...</div>
      ) : question ? (
        <>
          <div className="p-4 border rounded bg-white mb-4">{question.questions?.text}</div>
          {/* 상태별 UI */}
          {question.status === "today" && (
            <>
              <Textarea
                className="mb-2"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="여기에 답변을 입력하세요 (최대 500자)"
                maxLength={500}
                rows={4}
              />
              <Button onClick={handleSubmit} disabled={submitting || !answer.trim()}>
                {submitting ? "저장 중..." : "답변 제출"}
              </Button>
            </>
          )}
          {question.status === "1-reply" && (
            myAnswer ? (
              <div className="text-blue-600 font-semibold">상대방 답변 대기 중입니다.</div>
            ) : (
              <>
                <div className="text-gray-500 mb-2">상대방이 먼저 답변했습니다. 내 답변을 입력하세요!</div>
                <Textarea
                  className="mb-2"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="여기에 답변을 입력하세요 (최대 500자)"
                  maxLength={500}
                  rows={4}
                />
                <Button onClick={handleSubmit} disabled={submitting || !answer.trim()}>
                  {submitting ? "저장 중..." : "답변 제출"}
                </Button>
              </>
            )
          )}
          {question.status === "2-reply" && (
            <div className="text-green-600 font-semibold">오늘의 질문, 모두 답변 완료!</div>
          )}
          {myTodayAnswer && (
            <div className="mt-6 p-4 border rounded bg-blue-50">
              <div className="text-xs text-gray-500 mb-1">내 답변</div>
              <div className="font-medium">{myTodayAnswer.answer_text}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(myTodayAnswer.created_at).toLocaleString()}</div>
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-400">오늘의 질문이 없습니다.</div>
      )}
    </div>
  );
} 