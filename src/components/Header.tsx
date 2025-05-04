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
    <header className="w-full flex justify-between items-center px-4 py-2 border-b">
      <Link href="/" className="font-bold text-lg">MORY</Link>
      {user ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
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