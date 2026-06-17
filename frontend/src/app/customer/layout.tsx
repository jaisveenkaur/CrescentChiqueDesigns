'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomerNav from '@/components/customer-nav';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    
    if (!token) {
      router.push('/login?expired=true');
    } else if (role !== 'customer') {
      router.push('/login'); // Prevent admins from accessing customer space directly
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
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
