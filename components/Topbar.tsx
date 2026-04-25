"use client";

import Link from 'next/link';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Menu } from 'lucide-react';


interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, userImage } = useAuth();

  const userInitial = user?.email ? user.email[0].toUpperCase() : user?.displayName ? user.displayName[0].toUpperCase() : '?';

  return (
    <header className="h-20 bg-white border-b border-card-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Left - Brand Name */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors text-navy"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          AI Active
        </div>
      </div>

      {/* Center - Welcome message */}
      <div className="hidden lg:flex items-center gap-1 text-gray-500 font-medium">
        <span>Welcome,</span>
        <span className="text-navy font-bold">{user?.displayName || 'Guest'}</span>
      </div>

      {/* Right - Profile/Email initial */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold text-navy truncate max-w-[120px]">
              {user?.email}
            </span>
            <span className="text-[10px] text-success font-bold uppercase tracking-widest">Online</span>
          </div>
          <Link
            href="/settings"
            className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-md transition-all hover:scale-105 cursor-pointer overflow-hidden ring-2 ring-accent/50"
          >
            {userImage || user?.photoURL ? (
              <img src={userImage || user?.photoURL || ''} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              userInitial
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
