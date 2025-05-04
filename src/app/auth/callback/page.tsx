"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const syncProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 카카오 닉네임 추출
        const nickname = user.user_metadata?.nickname || user.email?.split('@')[0] || '사용자';
        // profiles 테이블에 upsert
        await supabase.from('profiles').upsert({
          id: user.id,
          nickname,
        });
      }
      router.replace('/');
    };
    syncProfile();
  }, [router]);

  return <div>로그인 처리 중...</div>;
} 