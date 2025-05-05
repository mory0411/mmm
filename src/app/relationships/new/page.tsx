"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

export default function NewRelationship() {
  const [role, setRole] = useState<'parent' | 'child'>('parent');
  const [hashCode, setHashCode] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [myRelationshipName, setMyRelationshipName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleCreateRelationship = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('relationships')
      .insert({
        child_user_id: role === 'child' ? user.id : null,
        parent_user_id: role === 'parent' ? user.id : null,
        hash_code: crypto.randomUUID(), // 또는 해시 함수 사용
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating relationship:', error);
      return;
    }

    // 관계 생성과 동시에 내 별칭 저장
    if (myRelationshipName.trim()) {
      await supabase.from('relationship_names').upsert({
        relationship_id: data.id,
        user_id: user.id,
        name: myRelationshipName.trim(),
      });
    }

    setHashCode(data.hash_code);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {user && (
        <div className="mb-4 text-sm text-gray-600">로그인: {user.user_metadata?.nickname || user.email}</div>
      )}
      <h1>새 관계 생성</h1>
      <div className="flex flex-col gap-2 my-4 w-full max-w-xs">
        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="parent"
              checked={role === 'parent'}
              onChange={() => setRole('parent')}
            />
            <span>부모</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="child"
              checked={role === 'child'}
              onChange={() => setRole('child')}
            />
            <span>자녀</span>
          </label>
        </div>
        <input
          className="border rounded px-2 py-1"
          value={myRelationshipName}
          onChange={e => setMyRelationshipName(e.target.value)}
          placeholder="이 관계를 부를 이름을 입력하세요"
          maxLength={30}
        />
      </div>
      <Button onClick={handleCreateRelationship}>관계 생성</Button>
      {hashCode && (
        <div className="mt-4">
          <p>생성된 관계 코드: {hashCode}</p>
          <Button onClick={() => {
            navigator.clipboard.writeText(`https://mmm-brown.vercel.app/r/${hashCode}`);
            toast("공유 링크가 복사되었습니다!");
          }}>
            주소 복사 및 공유하기
          </Button>
        </div>
      )}
    </div>
  );
} 