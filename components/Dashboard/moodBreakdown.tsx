'use client'

import React, { useState, useEffect } from 'react'
import { moodService } from '@/lib/firestore-service'
import { useAuth } from '@/context/AuthContext'

interface MoodStat {
    _id: string;
    count: number;
    label: string;
}

const colorMap: Record<string, string> = {
    'low': 'bg-slate-400',
    'sad': 'bg-purple-400',
    'okay': 'bg-amber-400',
    'good': 'bg-blue-400',
    'great': 'bg-emerald-400',
}

const MoodBreakdown = ({ refreshKey }: { refreshKey?: number }) => {
    const { user, loading: authLoading } = useAuth();
    const [moods, setMoods] = useState<{ label: string, value: number, color: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;

        const unsubscribe = moodService.subscribeMoodData(user.uid, (data) => {
            if (data.breakdown) {
                const formattedMoods = data.breakdown.map((m: any) => ({
                    label: m.label,
                    value: m.count,
                    color: colorMap[m._id] || 'bg-gray-300'
                }));
                setMoods(formattedMoods);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-card-border h-[400px] flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-bold uppercase tracking-widest">Analyzing patterns...</div>
            </div>
        );
    }

    const total = moods.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-card-border h-full">
            <h3 className="text-2xl font-bold text-navy mb-8">Reflections by mood</h3>
            
            <div className="space-y-6">
                {moods.length > 0 ? moods.map((mood, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-navy/60 uppercase tracking-wider text-[10px]">{mood.label}</span>
                            <span className="text-navy">{Math.round((mood.value / total) * 100)}%</span>
                        </div>
                        <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${mood.color} transition-all duration-1000 ease-out`}
                                style={{ width: `${(mood.value / total) * 100}%` }}
                            />
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-30">
                        <div className="text-4xl mb-4">📊</div>
                        <p className="text-xs font-bold uppercase tracking-widest">No data available yet</p>
                    </div>
                )}
            </div>

            {moods.length > 0 && (
                <div className="mt-10 pt-6 border-t border-gray-50">
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                        Based on your last {total} reflections. Consistency in logging helps identify long-term emotional trends.
                    </p>
                </div>
            )}
        </div>
    )
}

export default MoodBreakdown