"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

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
      <h1 className="text-2xl font-bold mb-4">과거 질문-답변 히스토리</h1>
      {loading ? (
        <div className="text-gray-400">로딩 중...</div>
      ) : qaGroups.length === 0 ? (
        <div className="text-gray-400">아직 답변한 내용이 없습니다.</div>
      ) : (
        <ul className="space-y-6">
          {qaGroups.map((group) => (
            <li key={group.question_id} className="border rounded-lg p-4 bg-white shadow">
              <div className="font-semibold mb-2">{group.question_text}</div>
              <div className="flex flex-row gap-4">
                <div className="flex-1 bg-blue-50 rounded p-2">
                  <span className="font-bold text-blue-700">부모: </span>
                  {group.parent ? (
                    <>
                      {group.parent.answer_text}
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(group.parent.created_at).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">아직 답변 없음</span>
                  )}
                </div>
                <div className="flex-1 bg-green-50 rounded p-2">
                  <span className="font-bold text-green-700">자녀: </span>
                  {group.child ? (
                    <>
                      {group.child.answer_text}
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(group.child.created_at).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">아직 답변 없음</span>
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