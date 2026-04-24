"use client";

import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

const moods = [
    { id: 'low', label: 'Low', emoji: '😔' },
    { id: 'sad', label: 'Sad', emoji: '🙁' },
    { id: 'okay', label: 'Okay', emoji: '😐' },
    { id: 'good', label: 'Good', emoji: '🙂' },
    { id: 'great', label: 'Great', emoji: '😁' },
];

const EmojiSelector = ({ onMoodSaved }: { onMoodSaved?: () => void }) => {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch current mood for today
        const fetchMood = async () => {
            try {
                const res = await fetch('/api/mood');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.currentMood) {
                        setSelectedMood(data.currentMood);
                    }
                }
            } catch (error) {
                console.error('Error fetching mood:', error);
            }
        };
        fetchMood();
    }, []);

    const handleMoodSelect = async (moodId: string, label: string) => {
        if (isLoading) return;

        setSelectedMood(moodId);
        setIsLoading(true);

        try {
            const res = await fetch('/api/mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood: moodId, label }),
            });

            if (!res.ok) {
                throw new Error('Failed to save mood');
            }

            if (onMoodSaved) onMoodSaved();
        } catch (error) {
            console.error('Error saving mood:', error);
            // Optionally revert UI state on error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#0B0E14] rounded-[32px] p-8 md:p-10 relative overflow-hidden text-white shadow-2xl border border-white/5">
            {/* Decorative Leaf */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 md:opacity-100">
                <div className="w-16 h-16 md:w-20 md:h-20 text-green-500 transform rotate-12">
                    <Leaf size={64} strokeWidth={1.5} />
                </div>
            </div>

            <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                        How are you feeling today?
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base max-w-lg">
                        Check in, write your thoughts, or just say hello — Emora is here for all of it.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 md:gap-4 pt-2">
                    {moods.map((mood) => {
                        const isActive = selectedMood === mood.id;
                        const moodColors: Record<string, string> = {
                            great: '#10B981',
                            good: '#3B82F6',
                            okay: '#F59E0B',
                            sad: '#8B5CF6',
                            low: '#64748B',
                        };
                        const activeColor = moodColors[mood.id] || '#6C8EF5';

                        return (
                            <button
                                key={mood.id}
                                onClick={() => handleMoodSelect(mood.id, mood.label)}
                                disabled={isLoading}
                                className={`
                                    flex flex-col items-center justify-center 
                                    w-[72px] h-[84px] md:w-[84px] md:h-[96px] 
                                    rounded-2xl transition-all duration-300
                                    ${isActive
                                        ? 'bg-[#1E293B] shadow-[0_0_15px_rgba(30,41,59,0.5)]'
                                        : 'bg-[#161B22] border border-white/5 hover:bg-[#1E293B] hover:border-white/10'
                                    }
                                `}
                                style={isActive ? { borderColor: activeColor, borderSize: '2px', borderStyle: 'solid', boxShadow: `0 0 15px ${activeColor}40` } : {}}
                            >
                                <span className="text-2xl md:text-3xl mb-1">{mood.emoji}</span>
                                <span className={`text-[10px] md:text-xs font-medium transition-colors duration-300 ${isActive ? '' : 'text-gray-500'}`} style={isActive ? { color: activeColor } : {}}>
                                    {mood.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EmojiSelector;