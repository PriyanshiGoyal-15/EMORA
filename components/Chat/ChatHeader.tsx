import React from 'react';
import { Sparkles, Menu, Plus, Trash2, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
    onMenuClick: () => void;
    onNewChatMobile: () => void;
    onDeleteClick: () => void;
    currentConvoId: string | null;
}

export default function ChatHeader({
    onMenuClick,
    onNewChatMobile,
    onDeleteClick,
    currentConvoId
}: ChatHeaderProps) {
    return (
        <div className="px-6 py-5 lg:px-8 lg:py-6 border-b border-navy/5 flex items-center justify-between bg-white/40 backdrop-blur-3xl sticky top-0 z-[40]">
            <div className="flex items-center gap-4 lg:gap-6">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-navy/5 rounded-xl transition-all text-navy/40 active:scale-95"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-3 lg:gap-6 group ">
                    <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-[16px] lg:rounded-[20px] bg-white shadow-xl shadow-navy/5 border border-navy/5 flex items-center justify-center shrink-0 relative overflow-hidden transition-transform duration-500 group-hover:scale-105  ">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5 opacity-50" />
                        <div className="w-7 h-7 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 ">
                            <Sparkles size={14} className="text-white lg:w-5 lg:h-5" />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-[15px] lg:text-[19px] font-black text-navy tracking-tight">Emora AI</h1>
                        <div className="flex items-center gap-1.5 lg:gap-2">
                            <div className="relative flex">
                                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25"></span>
                                <span className="relative w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-500"></span>
                            </div>
                            <span className="text-[8px] lg:text-[9px] text-emerald-600 font-black uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
                <button onClick={onNewChatMobile} className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-navy/5 rounded-2xl transition-all text-navy/20 active:scale-95">
                    <Plus size={20} strokeWidth={3} />
                </button>
                {currentConvoId && (
                    <button
                        onClick={onDeleteClick}
                        className="w-10 h-10 flex items-center justify-center hover:bg-red-50 rounded-2xl transition-all text-navy/20 hover:text-red-500 active:scale-95"
                        title="Delete Conversation"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
            </div>
        </div>
    );
}
