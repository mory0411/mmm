"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/" className="font-bold text-xl text-primary">MORY</Link>
      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user.user_metadata?.nickname || user.email} 님
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>로그아웃</Button>
        </div>
      ) : (
        <Link href="/auth/login">
          <Button size="sm">로그인</Button>
        </Link>
      )}
    </header>
  );
} 