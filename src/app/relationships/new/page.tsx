"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function NewRelationship() {
  const [role, setRole] = useState<'parent' | 'child'>('parent');
  const [hashCode, setHashCode] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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

    setHashCode(data.hash_code);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {user && (
        <div className="mb-4 text-sm text-gray-600">로그인: {user.user_metadata?.nickname || user.email}</div>
      )}
      <h1>새 관계 생성</h1>
      <div className="flex gap-4 my-4">
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
      <Button onClick={handleCreateRelationship}>관계 생성</Button>
      {hashCode && (
        <div className="mt-4">
          <p>생성된 관계 코드: {hashCode}</p>
          <Button onClick={() => navigator.clipboard.writeText(`https://mmm-brown.vercel.app/r/${hashCode}`)}>
            주소 복사 및 공유하기
          </Button>
        </div>
      )}
    </div>
  );
} 