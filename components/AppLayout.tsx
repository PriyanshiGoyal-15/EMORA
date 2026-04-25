"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hide Topbar/Sidebar only on Auth pages now
  const isAuthPage = pathname?.startsWith('/auth');

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.push('/auth/signin');
    }
  }, [user, loading, isAuthPage, router]);

  if (loading && !isAuthPage) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-navy/40 font-bold text-xs uppercase tracking-widest">Initializing Emora...</p>
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="flex bg-background h-screen text-navy overflow-hidden relative">
      {/* Sidebar - Handles its own mobile visibility */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className={`flex-1 ${pathname === '/chat' ? 'overflow-hidden' : 'overflow-y-auto p-4'} bg-[#f8faff]`}>
          <div className={pathname === '/chat' ? 'h-full' : 'max-w-7xl mx-auto'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
