"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [relationships, setRelationships] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("relationships")
      .select("*")
      .or(`parent_user_id.eq.${user.id},child_user_id.eq.${user.id}`)
      .then(({ data }) => setRelationships(data || []));
  }, [user]);

  return (
    <div className="max-w-xl mx-auto py-8">
      {user && (
        <div className="mb-4 text-sm text-gray-600">
          로그인: {user.user_metadata?.nickname || user.email}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">내 관계 목록</h1>
      <Link href="/relationships/new">
        <Button className="mb-6">+ 새 관계 생성</Button>
      </Link>
      <div className="space-y-4">
        {relationships.length === 0 && <div>참여 중인 관계가 없습니다.</div>}
        {relationships.map((rel) => (
          <div key={rel.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">관계 코드: {rel.hash_code}</div>
              <div>내 역할: {rel.parent_user_id === user.id ? "부모" : "자녀"}</div>
              <div className="text-xs text-gray-400">생성일: {rel.created_at?.slice(0, 10)}</div>
            </div>
            <Link href={`/r/${rel.hash_code}`}>
              <Button>입장</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
