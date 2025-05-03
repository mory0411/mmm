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

  const handleRoleSelect = async (role: "parent" | "child") => {
    if (!user || !relationship) return;
    const updateField =
      role === "parent" ? { parent_user_id: user.id } : { child_user_id: user.id };
    const { error } = await supabase
      .from("relationships")
      .update(updateField)
      .eq("id", relationship.id);
    if (!error) {
      // 새로고침하여 참여 상태 반영
      location.reload();
    }
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

  // TODO: Q&A UI로 대체
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Q&A 화면 (준비 중)</h1>
      <p>관계 코드: {relationship.hash_code}</p>
      <p>내 역할: {relationship.parent_user_id === user.id ? "부모" : "자녀"}</p>
    </div>
  );
} 