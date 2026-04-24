'use client'

import React, { useState } from 'react';
import DeleteModal from '../DeleteModal';

interface JournalCardProps {
    id: string;
    date: string;
    title: string;
    content: string;
    mood: 'Anxious' | 'Calm' | 'Happy' | 'Sad' | 'Neutral';
    emoji: string;
    tags?: string[];
    status?: 'draft' | 'published';
    onDelete?: (id: string) => void;
    onClick?: () => void;
}

const moodColors: Record<string, { gradient: string, bg: string, text: string, tag: string }> = {
    Low: {
        gradient: 'from-[#7C6AF7] to-[#4F46E5]',
        bg: 'bg-purple-500/10',
        text: 'text-[#7C6AF7]',
        tag: 'bg-[#7C6AF7]/10'
    },
    Sad: {
        gradient: 'from-[#FF8C00] to-[#FF4500]',
        bg: 'bg-orange-500/10',
        text: 'text-[#FF8C00]',
        tag: 'bg-[#FF8C00]/10'
    },
    Okay: {
        gradient: 'from-gray-400 to-gray-600',
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        tag: 'bg-gray-500/10'
    },
    Good: {
        gradient: 'from-[#3CC98A] to-[#00DDAA]',
        bg: 'bg-emerald-500/10',
        text: 'text-[#3CC98A]',
        tag: 'bg-[#3CC98A]/10'
    },
    Great: {
        gradient: 'from-[#6C8EF5] to-[#7C6AF7]',
        bg: 'bg-blue-500/10',
        text: 'text-[#6C8EF5]',
        tag: 'bg-[#6C8EF5]/10'
    }
};

import { Trash2, Edit3 } from 'lucide-react';

export default function JournalCard({ id, date, title, content, mood, emoji, tags = [], status = 'published', onDelete, onClick }: JournalCardProps) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const colors = moodColors[mood] || moodColors.Neutral;
    const isDraft = status === 'draft';

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    return (
        <div
            onClick={onClick}
            className={`relative group rounded-[16px] overflow-hidden transition-all hover:scale-[1.01] flex flex-col h-full cursor-pointer ring-1 ring-inset ring-white/2 ${isDraft ? 'border-2 border-dashed border-navy/10 bg-navy/[0.02]' : 'bg-transparent border border-white/8 shadow-sm'
                }`}
        >
            {/* Top Mood Gradient Stripe */}
            <div className={`h-[3.5px] w-full bg-linear-to-r ${colors.gradient} ${isDraft ? 'opacity-30' : ''}`} />

            {/* Status Badge */}
            {isDraft && (
                <div className="absolute top-4 right-12 px-2 py-0.5 bg-navy/5 text-[8px] font-black uppercase tracking-widest text-navy/40 rounded-sm">
                    Draft
                </div>
            )}

            <div className="absolute top-4 right-4 opacity-100 md:opacity-60 md:group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                    className="p-2 bg-white/80 backdrop-blur-sm text-primary hover:bg-primary/5 rounded-lg shadow-sm transition-all"
                >
                    <Edit3 size={14} />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2 bg-white/80 backdrop-blur-sm text-red-500 hover:bg-red-50 rounded-lg shadow-sm transition-all"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="p-5 lg:p-6 flex flex-col h-full space-y-4">
                {/* Date */}
                <span className="text-[10px] font-medium text-gray-500 tracking-wider uppercase">
                    {date}
                </span>

                {/* Title and Content */}
                <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-bold text-primary leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {title}
                    </h3>
                    <div
                        className={`text-[13px] leading-relaxed line-clamp-3 font-medium opacity-70 whitespace-pre-wrap ${isDraft ? 'text-gray-400' : 'text-gray-500'}`}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>

                {/* Tags Row */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-navy/5 text-[9px] font-bold text-navy/40 rounded-md">
                                {tag}
                            </span>
                        ))}
                        {tags.length > 3 && <span className="text-[9px] font-bold text-navy/20 self-center">+{tags.length - 3}</span>}
                    </div>
                )}

                {/* Bottom Details */}
                <div className="flex items-center justify-between pt-4 mt-auto">
                    <span className="text-xl filter drop-shadow-md">
                        {emoji}
                    </span>
                    <div className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${colors.tag} ${colors.text} border border-current/10`}>
                        {mood}
                    </div>
                </div>
            </div>
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    onDelete?.(id);
                    setIsDeleteModalOpen(false);
                }}
                title="Delete Entry?"
                description="This will permanently remove this journal entry and all its insights. This action cannot be undone."
            />
        </div>
    );
}
