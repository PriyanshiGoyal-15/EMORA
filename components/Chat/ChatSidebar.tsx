import React from 'react';
import { Plus, X } from 'lucide-react';

interface Conversation {
    id: string;
    title: string;
    preview: string;
    date: string;
}

interface ChatSidebarProps {
    conversations: Conversation[];
    currentConvoId: string | null;
    onSelect: (convo: Conversation) => void;
    onNewChat: () => void;
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    userEmail?: string;
}

export default function ChatSidebar({
    conversations,
    currentConvoId,
    onSelect,
    onNewChat,
    isOpen,
    onClose,
    userName,
    userEmail
}: ChatSidebarProps) {
    const userInitial = userName ? userName.charAt(0) : (userEmail ? userEmail.charAt(0).toUpperCase() : 'U');

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="absolute inset-0 bg-navy/40 backdrop-blur-md z-55 lg:hidden animate-in fade-in duration-500"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                absolute inset-y-0 left-0 w-[300px] bg-white z-60 transform transition-all duration-500 ease-in-out border-r border-navy/5 flex flex-col
                lg:static lg:translate-x-0 lg:w-80 lg:bg-white/60 lg:backdrop-blur-3xl
                ${isOpen ? 'translate-x-0 shadow-2xl shadow-navy/20' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-6 bg-primary rounded-full" />
                        <h2 className="text-2xl font-black text-navy tracking-tighter">History</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-navy/5 rounded-2xl transition-all group"
                    >
                        <X size={20} className="text-navy/30 group-hover:text-navy transition-colors" />
                    </button>
                </div>

                <div className="px-6 pb-8">
                    <button
                        onClick={onNewChat}
                        className="w-full h-14 bg-linear-to-br from-primary to-accent hover:scale-[1.02] active:scale-[0.98] text-white rounded-[20px] flex items-center justify-center gap-3 transition-all font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <Plus size={20} strokeWidth={3} className="relative z-10" />
                        <span className="relative z-10">New chat</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-3 custom-scrollbar py-2">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy/20 mb-4">
                                <Plus size={24} />
                            </div>
                            <p className="text-xs font-bold text-navy/30 uppercase tracking-widest">No history yet</p>
                        </div>
                    ) : (
                        conversations.map((convo) => (
                            <button
                                key={convo.id}
                                onClick={() => onSelect(convo)}
                                className={`w-full p-4 rounded-2xl text-left transition-all group relative overflow-hidden ${currentConvoId === convo.id
                                    ? 'bg-white shadow-xl shadow-navy/5 border border-navy/5 scale-[1.02] z-10'
                                    : 'hover:bg-white border border-transparent hover:border-navy/5'
                                    }`}
                            >
                                {currentConvoId === convo.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                )}
                                <div className="flex justify-between items-start mb-1.5">
                                    <h3 className={`font-bold text-[13px] truncate pr-4 ${currentConvoId === convo.id ? 'text-primary' : 'text-navy'}`}>
                                        {convo.title}
                                    </h3>
                                    <span className="text-[9px] font-black text-navy/20 whitespace-nowrap uppercase tracking-tighter">
                                        {new Date(convo.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-[11px] text-navy/40 truncate font-medium">{convo.preview}</p>
                            </button>
                        ))
                    )}
                </div>

                {/* <div className="p-6 border-t border-navy/5 bg-white/40">
                    <div className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-white transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center text-white font-black shadow-lg shadow-navy/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 group-hover:scale-110 transition-transform duration-500" />
                            <span className="relative z-10 text-lg">{userInitial}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-navy uppercase tracking-wider">{userName || 'User'}</p>
                            <p className="text-[10px] text-navy/30 truncate font-medium">{userEmail}</p>
                        </div>
                    </div>
                </div> */}
            </div>
        </>
    );
}
