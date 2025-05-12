"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type QAGroup = {
  question_id: string;
  question_text: string;
  parent?: any;
  child?: any;
};

export default function RelationshipHistoryPage() {
  const { hash } = useParams();
  const [qaGroups, setQaGroups] = useState<QAGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      // 1. hash_code로 relationship_id 조회
      const { data: relationship } = await supabase
        .from("relationships")
        .select("id")
        .eq("hash_code", hash)
        .single();

      if (!relationship) {
        setQaGroups([]);
        setLoading(false);
        return;
      }

      // 2. 해당 관계의 모든 답변 + 질문 내용 조회
      const { data } = await supabase
        .from("answers")
        .select("*, questions(text)")
        .eq("relationship_id", relationship.id)
        .order("created_at", { ascending: false });

      // 3. question_id별로 그룹화
      const groupMap: { [qid: string]: QAGroup } = {};
      (data || []).forEach((item: any) => {
        if (!groupMap[item.question_id]) {
          groupMap[item.question_id] = {
            question_id: item.question_id,
            question_text: item.questions?.text || "",
          };
        }
        if (item.role === "parent") groupMap[item.question_id].parent = item;
        if (item.role === "child") groupMap[item.question_id].child = item;
      });

      setQaGroups(Object.values(groupMap));
      setLoading(false);
    };

    fetchHistory();
  }, [hash]);

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">과거 질문-답변 히스토리</h1>
        <Link href={`/r/${hash}`}>
          <Button variant="outline" size="sm">이전으로</Button>
        </Link>
      </div>
      {loading ? (
        <div className="text-muted-foreground">로딩 중...</div>
      ) : qaGroups.length === 0 ? (
        <div className="text-muted-foreground">아직 답변한 내용이 없습니다.</div>
      ) : (
        <ul className="space-y-8">
          {qaGroups.map((group) => (
            <li key={group.question_id} className="border rounded-2xl p-6 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-xs text-muted-foreground mb-1">
                {new Date(group.parent?.created_at || group.child?.created_at).toLocaleDateString()}
              </div>
              <div className="font-medium mb-4 text-lg text-foreground/90">{group.question_text}</div>
              <div className="flex flex-col gap-4">
                <div className="bg-secondary/20 rounded-xl p-4">
                  <span className="font-bold text-secondary-foreground block mb-2">부모</span>
                  {group.parent ? (
                    <>
                      <div className="text-foreground/90">{group.parent.answer_text}</div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">아직 답변 없음</span>
                  )}
                </div>
                <div className="bg-accent/20 rounded-xl p-4">
                  <span className="font-bold text-accent-foreground block mb-2">자녀</span>
                  {group.child ? (
                    <>
                      <div className="text-foreground/90">{group.child.answer_text}</div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">아직 답변 없음</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 