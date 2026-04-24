'use client'

import React, { useState, useEffect } from 'react'

interface MoodLog {
    text: string;
    mood: string;
    timestamp: string;
    type: string;
}

interface MoodSegment {
    mood: string;
    percentage: number;
}

interface DayData {
    day: string;
    height: string;
    active: boolean;
    segments: MoodSegment[];
}

const MoodGraph = ({ refreshKey }: { refreshKey?: number }) => {
    const [days, setDays] = useState<DayData[]>([]);
    const [logs, setLogs] = useState<MoodLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const MOOD_COLORS: Record<string, string> = {
        'low': 'bg-purple-300',
        'sad': 'bg-orange-300',
        'okay': 'bg-amber-300',
        'good': 'bg-emerald-300',
        'great': 'bg-blue-300'
    };

    const TAG_STYLES: Record<string, any> = {
        'Low': { bg: 'bg-[#F1F5F9]', text: 'text-[#334155]', dot: 'bg-[#64748B]' },
        'Sad': { bg: 'bg-[#F5F3FF]', text: 'text-[#6D28D9]', dot: 'bg-[#8B5CF6]' },
        'Okay': { bg: 'bg-[#FFFBEB]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
        'Good': { bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', dot: 'bg-[#3B82F6]' },
        'Great': { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', dot: 'bg-[#10B981]' },
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/mood');
                if (res.ok) {
                    const data = await res.json();
                    if (data.history) setDays(data.history);
                    if (data.logs) setLogs(data.logs);
                }
            } catch (error) {
                console.error('Error fetching mood history:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [refreshKey]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-[24px] sm:rounded-[32px] p-8 shadow-sm border border-card-border h-[400px] flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading charts...</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 shadow-sm border border-card-border h-full w-full">
            <div className="w-full">
                <h3 className="text-lg sm:text-2xl font-bold text-navy mb-6 sm:mb-8">This week's mood</h3>

                <div className="flex items-end justify-between gap-2 sm:gap-4 md:gap-6 h-50 sm:h-44 mb-6 overflow-x-hidden">
                    {days.map((item) => {
                        const isToday = item.active;
                        const hasSegments = item.segments && item.segments.length > 0;

                        return (
                            <div key={item.day} className="flex-1 flex flex-col items-center justify-end h-full gap-3 sm:gap-4">
                                <div
                                    className={`w-full max-w-[64px] rounded-xl overflow-hidden transition-all duration-500 hover:brightness-95 cursor-pointer flex flex-col-reverse
                                        ${!hasSegments ? 'bg-gray-100' : ''}
                                    `}
                                    style={{ height: item.height === '0%' ? '4px' : item.height }}
                                >
                                    {hasSegments ? item.segments.map((seg, idx) => (
                                        <div
                                            key={idx}
                                            className={`${MOOD_COLORS[seg.mood] || 'bg-gray-300'} w-full transition-all duration-500`}
                                            style={{ height: `${seg.percentage}%` }}
                                        />
                                    )) : null}
                                </div>
                                <span className="text-[10px] sm:text-sm font-semibold text-gray-400">{item.day}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 space-y-3">
                    {logs.length > 0 ? logs.map((log, index) => {
                        const style = TAG_STYLES[log.mood] || TAG_STYLES['Okay'];
                        return (
                            <div key={index} className="flex items-center justify-between bg-white rounded-2xl p-4 sm:p-5 hover:bg-gray-50 transition-colors cursor-pointer border border-[#F3F4F6]">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2.5 h-2.5 rounded-full ${style.dot} shrink-0`}></div>
                                    <p className="text-sm sm:text-[16px] font-bold text-navy leading-tight truncate">
                                        {log.text}
                                    </p>
                                </div>
                                <span className={`px-4 sm:px-6 py-1.5 rounded-full text-[10px] sm:text-xs font-bold ${style.bg} ${style.text} shrink-0`}>
                                    {log.mood}
                                </span>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            No logs yet. Select a mood to see your history!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MoodGraph
