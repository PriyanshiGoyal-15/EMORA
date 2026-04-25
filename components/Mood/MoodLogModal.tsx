'use client';

import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { moodService } from '@/lib/firestore-service';
import { useAuth } from '@/context/AuthContext';

interface MoodLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMoodSaved?: () => void;
}

const moods = [
    { id: 'low', label: 'Low', emoji: '😞', color: 'text-slate-500', bg: 'bg-slate-500/10' },
    { id: 'sad', label: 'Sad', emoji: '😢', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'okay', label: 'Okay', emoji: '😐', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'good', label: 'Good', emoji: '😊', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'great', label: 'Great', emoji: '😁', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

export default function MoodLogModal({ isOpen, onClose, onMoodSaved }: MoodLogModalProps) {
    const { user } = useAuth();
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!selectedMood || !user) return;

        setIsSaving(true);
        try {
            const moodData = moods.find(m => m.id === selectedMood);
            await moodService.addMood(user.uid, {
                mood: selectedMood,
                label: moodData?.label || 'Okay',
                note: note.trim() || ""
            });

            onMoodSaved?.();
            onClose();
            setSelectedMood(null);
            setNote('');
        } catch (error) {
            console.error('Error logging mood:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-navy/40 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-gray-100">
                    <h2 className="text-xl font-bold text-navy">How are you feeling?</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Mood Grid */}
                    <div className="grid grid-cols-5 gap-2">
                        {moods.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMood(m.id)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${selectedMood === m.id
                                    ? `${m.bg} ring-2 ring-navy/5 scale-105`
                                    : 'hover:bg-gray-50 text-gray-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                    }`}
                            >
                                <span className="text-3xl filter drop-shadow-sm">{m.emoji}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedMood === m.id ? m.color : ''}`}>
                                    {m.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Optional Note */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 px-1">
                            Any specific notes? (Optional)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="What triggered this feeling?"
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm text-navy placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleSave}
                        disabled={!selectedMood || isSaving}
                        className="w-full py-4 bg-navy text-white rounded-2xl font-bold text-sm shadow-xl shadow-navy/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Check size={18} strokeWidth={3} />
                                Log My Mood
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
