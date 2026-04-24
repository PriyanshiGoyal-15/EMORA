'use client'

import React, { useState, useEffect } from 'react'

interface MoodStat {
    _id: string;
    count: number;
    label: string;
}

const colorMap: Record<string, string> = {
    'low': 'bg-purple-300',
    'sad': 'bg-orange-300',
    'okay': 'bg-amber-300',
    'good': 'bg-emerald-300',
    'great': 'bg-blue-300',
}

const MoodBreakdown = ({ refreshKey }: { refreshKey?: number }) => {
    const [moods, setMoods] = useState<{ label: string, value: number, color: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBreakdown = async () => {
            try {
                const res = await fetch('/api/mood');
                if (res.ok) {
                    const data = await res.json();
                    if (data.breakdown) {
                        const total = data.breakdown.reduce((acc: number, curr: MoodStat) => acc + curr.count, 0);

                        // Map all potential moods to ensure consistent order
                        const order = ['great', 'good', 'okay', 'sad', 'low'];
                        const mappedMoods = order.map(type => {
                            const found = data.breakdown.find((b: MoodStat) => b._id === type);
                            const labelMap: Record<string, string> = {
                                'great': 'Great', 'good': 'Good', 'okay': 'Okay', 'sad': 'Sad', 'low': 'Low'
                            };
                            return {
                                label: labelMap[type],
                                value: total > 0 ? (found ? Math.round((found.count / total) * 100) : 0) : 0,
                                color: colorMap[type]
                            };
                        });

                        setMoods(mappedMoods);
                    }
                }
            } catch (error) {
                console.error('Error fetching breakdown:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBreakdown();
    }, [refreshKey]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-[24px] sm:rounded-[32px] p-8 shadow-sm border border-card-border h-[400px] flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading metrics...</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 md:p-7 lg:p-8 shadow-sm border border-card-border h-full">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-navy mb-6 sm:mb-8 lg:mb-10">Mood breakdown</h3>

            <div className="space-y-5 sm:space-y-6 md:space-y-8">
                {moods.length > 0 ? moods.map((mood) => (
                    <div key={mood.label} className="flex items-center gap-3 sm:gap-4">
                        <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-navy w-16 sm:w-20 md:w-22 lg:w-24 shrink-0">
                            {mood.label}
                        </span>

                        <div className="flex-1 h-2 sm:h-2.5 md:h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${mood.color} transition-all duration-1000 ease-in-out`}
                                style={{ width: `${mood.value}%` }}
                            ></div>
                        </div>

                        <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-400 w-10 sm:w-12 md:w-14 lg:w-16 text-right shrink-0">
                            {mood.value}%
                        </span>
                    </div>
                )) : (
                    <div className="text-center py-10 text-gray-400">
                        No data yet
                    </div>
                )}
            </div>
        </div>
    )
}

export default MoodBreakdown