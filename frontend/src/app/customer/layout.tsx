'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/auth-service';
import CustomerNav from '@/components/customer-nav';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?expired=true');
      } else if (user.role !== 'customer') {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-soft">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs uppercase tracking-widest text-gold font-bold">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-beige-soft">
      {/* Customer left sidebar (or mobile bottom nav) */}
      <CustomerNav />
      
      {/* Scrollable content screen */}
      <main className="flex-1 md:h-screen md:overflow-y-auto px-4 py-8 sm:p-10 pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
