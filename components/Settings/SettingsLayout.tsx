"use client";

import React from 'react';
import { User, Bell, Palette, Lock, CreditCard, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Section = 'profile' | 'notifications' | 'appearance' | 'password' | 'billing';

interface SettingsLayoutProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  children: React.ReactNode;
}

const navItems = [
  { id: 'profile' as const, name: 'Profile', icon: User, description: 'Personal info & deletion' },
  { id: 'notifications' as const, name: 'Notifications', icon: Bell, description: 'Alert preferences' },
  { id: 'appearance' as const, name: 'Appearance', icon: Palette, description: 'Visual settings' },
  { id: 'password' as const, name: 'Change Password', icon: Lock, description: 'Security credentials' },
  // { id: 'billing' as const, name: 'Billing', icon: CreditCard, description: 'Plans & payments' },
];

export default function SettingsLayout({ activeSection, onSectionChange, children }: SettingsLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-72 shrink-0">
        <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group shrink-0 lg:w-full text-left",
                  isActive ? "bg-white shadow-sm border border-gray-100 text-primary" : "hover:bg-white/50 text-gray-500 hover:text-navy"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-navy"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-bold leading-tight">{item.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{item.description}</p>
                </div>
                {isActive && <ChevronRight className="hidden lg:block w-4 h-4 ml-auto text-primary/40" />}
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
