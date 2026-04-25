'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { moodService } from '@/lib/firestore-service'

interface MoodLog {
    text: string;
    mood: string;
    timestamp: any;
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
    const { user, loading: authLoading } = useAuth();
    const [days, setDays] = useState<DayData[]>([]);
    const [logs, setLogs] = useState<MoodLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const MOOD_COLORS: Record<string, string> = {
        'low': 'bg-slate-400',
        'sad': 'bg-purple-400',
        'okay': 'bg-amber-400',
        'good': 'bg-blue-400',
        'great': 'bg-emerald-400'
    };

    const TAG_STYLES: Record<string, any> = {
        'Low': { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-500' },
        'Sad': { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
        'Okay': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
        'Good': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
        'Great': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    };

    useEffect(() => {
        if (authLoading || !user) return;

        const unsubscribe = moodService.subscribeMoodData(user.uid, (data) => {
            if (data.history) setDays(data.history);
            if (data.logs) setLogs(data.logs);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-[24px] sm:rounded-[32px] p-8 shadow-sm border border-card-border h-[400px] flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading charts...</div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h3 className="text-lg sm:text-2xl font-bold text-navy mb-6 sm:mb-8">This week's mood</h3>

            <div className="relative">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-20">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-full h-px bg-slate-200 border-t border-dashed border-slate-300" />
                    ))}
                </div>

                <div className="relative flex items-end justify-between gap-3 sm:gap-6 md:gap-8 h-48 sm:h-56 px-2">
                    {days.map((item) => {
                        const isToday = item.active;
                        const hasSegments = item.segments && item.segments.length > 0;

                        return (
                            <div key={item.day} className="flex-1 flex flex-col items-center justify-end h-full gap-4 group">
                                <div
                                    className={`w-full max-w-[48px] rounded-t-2xl overflow-hidden transition-all duration-700 ease-out hover:scale-x-110 cursor-pointer flex flex-col-reverse relative
                                        ${!hasSegments ? 'bg-slate-50 h-2!' : ''}
                                    `}
                                    style={{ height: item.height === '0%' ? '8px' : item.height }}
                                >
                                    {hasSegments ? item.segments.map((seg, idx) => (
                                        <div
                                            key={idx}
                                            className={`${MOOD_COLORS[seg.mood] || 'bg-slate-300'} w-full transition-all duration-500`}
                                            style={{ height: `${seg.percentage}%` }}
                                        />
                                    )) : null}

                                    {isToday && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2">
                                            <div className="bg-navy text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg whitespace-nowrap">Today</div>
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isToday ? 'text-primary' : 'text-slate-300'}`}>
                                    {item.day}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-4 pt-4 border-t border-slate-50 mt-10">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Check-ins</h4>
                    <div className="h-px bg-slate-100 flex-1 mx-4" />
                </div>

                <div className="space-y-2.5">
                    {logs.length > 0 ? logs.map((log, index) => {
                        const style = TAG_STYLES[log.mood] || TAG_STYLES['Okay'];
                        return (
                            <div key={index} className="flex items-center justify-between bg-white hover:bg-slate-50/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 border border-slate-50 hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/20 group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className={`w-3 h-3 rounded-full ${style.dot} shadow-xs ring-4 ring-white shrink-0 group-hover:scale-125 transition-transform`}></div>
                                    <p className="text-sm sm:text-base font-black text-navy leading-tight truncate">
                                        {log.text}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${style.bg} ${style.text} shadow-xs`}>
                                        {log.mood}
                                    </span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="bg-slate-50/50 rounded-3xl p-12 text-center border border-dashed border-slate-200">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">No footprints yet</p>
                            <p className="text-xs text-slate-300 font-medium">Log a mood to start your journey.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MoodGraph
