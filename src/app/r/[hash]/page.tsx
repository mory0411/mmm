"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function RelationshipRoom() {
  const params = useParams();
  const hash = params.hash as string;
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [relationship, setRelationship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [answerInputs, setAnswerInputs] = useState<{ [questionId: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [myRelationshipName, setMyRelationshipName] = useState<string>("");
  const [nameLoading, setNameLoading] = useState(true);
  const [nameEdit, setNameEdit] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!hash) return;
    supabase
      .from("relationships")
      .select("*")
      .eq("hash_code", hash)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("존재하지 않는 관계입니다.");
        } else {
          setRelationship(data);
        }
        setLoading(false);
      });
  }, [hash]);

  useEffect(() => {
    supabase
      .from("questions")
      .select("*")
      .order("id", { ascending: true })
      .then(({ data }) => setQuestions(data || []));
  }, []);

  useEffect(() => {
    if (!relationship) return;
    supabase
      .from("answers")
      .select("*")
      .eq("relationship_id", relationship.id)
      .then(({ data }) => setAnswers(data || []));
  }, [relationship, saving]);

  // 이미 참여 중이면 Q&A로 이동 or Q&A UI 표시
  useEffect(() => {
    if (!user || !relationship) return;
    if (
      relationship.parent_user_id === user.id ||
      relationship.child_user_id === user.id
    ) {
      // TODO: Q&A 화면으로 이동 or Q&A UI 표시
      // router.push(`/app/r/${hash}/qna`);
    }
  }, [user, relationship, hash, router]);

  // 내 별칭 불러오기
  useEffect(() => {
    if (!user || !relationship) return;
    setNameLoading(true);
    supabase
      .from("relationship_names")
      .select("name")
      .eq("relationship_id", relationship.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setMyRelationshipName(data?.name || "");
        setNameLoading(false);
      });
  }, [user, relationship]);

  const handleRoleSelect = async (role: "parent" | "child") => {
    if (!user || !relationship) return;
    const updateField =
      role === "parent" ? { parent_user_id: user.id } : { child_user_id: user.id };
    const { error, data } = await supabase
      .from("relationships")
      .update(updateField)
      .eq("id", relationship.id)
      .select()
      .maybeSingle();

    if (error) {
      alert("참여에 실패했습니다: " + error.message);
      return;
    }
    if (!data) {
      alert("참여에 실패했습니다. 이미 참여했거나, 권한이 없거나, 관계가 존재하지 않습니다.");
      return;
    }
    setRelationship({ ...relationship, ...updateField });
  };

  const handleSaveAnswer = async (questionId: number) => {
    if (!user || !relationship) return;
    setSaving(true);
    const myRole = relationship.parent_user_id === user.id ? "parent" : "child";
    const answerText = answerInputs[questionId];
    if (!answerText) return;
    await supabase.from("answers").upsert({
      relationship_id: relationship.id,
      question_id: questionId,
      user_id: user.id,
      answer_text: answerText,
      role: myRole,
    });
    setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
    setSaving(false);
  };

  // 별칭 저장
  const handleSaveName = async () => {
    if (!user || !relationship) return;
    setNameLoading(true);
    await supabase
      .from("relationship_names")
      .upsert({
        relationship_id: relationship.id,
        user_id: user.id,
        name: myRelationshipName,
      });
    setNameEdit(false);
    setNameLoading(false);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  // 아직 참여하지 않은 경우 역할 선택 UI
  if (
    relationship &&
    relationship.parent_user_id !== user?.id &&
    relationship.child_user_id !== user?.id
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1>관계 참여</h1>
        <p>이 관계에 어떤 역할로 참여하시겠습니까?</p>
        <div className="flex gap-4 mt-4">
          <Button onClick={() => handleRoleSelect("parent")}>부모로 참여</Button>
          <Button onClick={() => handleRoleSelect("child")}>자녀로 참여</Button>
        </div>
      </div>
    );
  }

  if (!user || !relationship) return null;

  const myRole = relationship.parent_user_id === user.id ? "parent" : "child";
  const otherRole = myRole === "parent" ? "child" : "parent";

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-xl font-bold mb-4">Q&A</h1>
      <div className="space-y-8">
        {questions.map((q) => {
          const myAnswer = answers.find(
            (a) => a.question_id === q.id && a.role === myRole
          );
          const otherAnswer = answers.find(
            (a) => a.question_id === q.id && a.role === otherRole
          );
          return (
            <div key={q.id} className="border rounded p-4">
              <div className="font-semibold mb-2">Q. {q.text}</div>
              <div className="mb-2">
                <div className="text-sm text-gray-500 mb-1">내 답변</div>
                {myAnswer ? (
                  <div className="p-2 bg-gray-100 rounded">{myAnswer.answer_text}</div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      className="border rounded px-2 py-1 flex-1"
                      value={answerInputs[q.id] || ""}
                      onChange={(e) =>
                        setAnswerInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="답변을 입력하세요"
                      maxLength={500}
                    />
                    <Button
                      onClick={() => handleSaveAnswer(q.id)}
                      disabled={saving || !(answerInputs[q.id] && answerInputs[q.id].trim())}
                    >
                      저장
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">상대 답변</div>
                {otherAnswer ? (
                  <div className="p-2 bg-gray-50 rounded">{otherAnswer.answer_text}</div>
                ) : (
                  <div className="text-gray-300">아직 답변이 없습니다.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* 내 별칭 입력/수정 UI */}
      <div className="mb-6">
        {nameLoading ? (
          <span className="text-gray-400">별칭 불러오는 중...</span>
        ) : nameEdit || !myRelationshipName ? (
          <div className="flex gap-2 items-center">
            <input
              className="border rounded px-2 py-1 flex-1"
              value={myRelationshipName}
              onChange={e => setMyRelationshipName(e.target.value)}
              placeholder="이 관계를 부를 이름을 입력하세요"
              maxLength={30}
            />
            <Button size="sm" onClick={handleSaveName} disabled={!myRelationshipName.trim()}>
              저장
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <span className="font-semibold">내 별칭: {myRelationshipName}</span>
            <Button size="sm" variant="outline" onClick={() => setNameEdit(true)}>
              수정
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 