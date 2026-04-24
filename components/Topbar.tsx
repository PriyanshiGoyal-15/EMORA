"use client";

import Link from 'next/link';
import React from 'react';
import { useSession } from 'next-auth/react';
import { Sparkles, Bell, Menu } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { data: session } = useSession();
  const [userImage, setUserImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/settings');
        const data = await res.json();
        if (res.ok && data.image) {
          setUserImage(data.image);
        }
      } catch (err) {
        console.error("Failed to fetch user image", err);
      }
    };
    if (session) fetchUser();
  }, [session]);

  const userInitial = session?.user?.email ? session.user.email[0].toUpperCase() : session?.user?.name ? session.user.name[0].toUpperCase() : '?';

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
        {/* <div className="logo-text text-xl md:text-2xl text-navy">
          Emora
        </div> 
       <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block" /> */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          AI Active
        </div>
      </div>

      {/* Center - Welcome message */}
      <div className="hidden lg:flex items-center gap-1 text-gray-500 font-medium">
        <span>Welcome,</span>
        <span className="text-navy font-bold">{session?.user?.name || 'Guest'}</span>
      </div>

      {/* Right - Profile/Email initial */}
      <div className="flex items-center gap-6">
        {/* <button className="text-gray-400 hover:text-navy transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full border-2 border-white" />
        </button> */}

        <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold text-navy truncate max-w-[120px]">
              {session?.user?.email}
            </span>
            <span className="text-[10px] text-success font-bold uppercase tracking-widest">Online</span>
          </div>
          <Link
            href="/settings"
            className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-md transition-all hover:scale-105 cursor-pointer overflow-hidden ring-2 ring-accent/50"
          >
            {userImage || session?.user?.image ? (
              <img src={userImage || session?.user?.image || ''} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              userInitial
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
