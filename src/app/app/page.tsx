"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AppDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>환영합니다, {user.user_metadata?.nickname || user.email}!</h1>
      <p>이메일: {user.email}</p>
      <p>UID: {user.id}</p>
    </div>
  );
} 