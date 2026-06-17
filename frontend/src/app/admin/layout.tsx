'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/auth-service';
import AdminNav from '@/components/admin-nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log(`[ADMIN GUARD] user: ${user?.email}, role: ${user?.role}, loading: ${loading}`);
    if (!loading) {
      if (!user) {
        console.warn(`[ADMIN GUARD] Redirecting to login: session expired or user context missing.`);
        router.push('/login?expired=true');
      } else if (user.role !== 'admin') {
        console.warn(`[ADMIN GUARD] Redirecting to login: user role ${user.role} is not admin.`);
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-soft">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs uppercase tracking-widest text-gold font-bold">Verifying Administrator Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-beige-soft">
      {/* Admin left sidebar (or mobile bottom nav) */}
      <AdminNav />
      
      {/* Scrollable content screen */}
      <main className="flex-1 md:h-screen md:overflow-y-auto px-4 py-8 sm:p-10 pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
