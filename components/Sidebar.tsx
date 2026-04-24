"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  MessageCircle,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Mood Tracker', href: '/mood', icon: LineChart },
  { name: 'AI Chat', href: '/chat', icon: MessageCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-40 lg:hidden transition-opacity animate-in fade-in"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-navy flex flex-col text-white/70 border-r border-white/5 font-sans transition-transform duration-300 transform lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Section */}
        <div className="p-8">
          <Link href="/" className="logo-text text-3xl text-white block">
            Emora
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide py-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-4 mb-4">
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-white/40 group-hover:text-white")} />
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile Section */}
        <div className="p-4 border-t border-white/5 bg-white/2">
          <Link
            href="/settings"
            className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group cursor-pointer border border-transparent hover:border-white/10"
          >
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg shadow-inner overflow-hidden shrink-0">
              {userImage || session?.user?.image ? (
                <img src={userImage || session?.user?.image || ''} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight group-hover:text-primary transition-colors">
                {session?.user?.name || 'User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-green-500 font-bold uppercase tracking-wider">Online</span>
              </div>
            </div>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-xs"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
