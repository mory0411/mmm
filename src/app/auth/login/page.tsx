"use client";

import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Button onClick={handleLogin}>카카오로 로그인</Button>
    </div>
  );
} 