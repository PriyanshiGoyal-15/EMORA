"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import MoodLogModal from '@/components/Mood/MoodLogModal';
import MoodCalendar from '@/components/Mood/MoodCalendar';
import MoodGraph from '@/components/Dashboard/moodChart';
import { moodService } from '@/lib/firestore-service';
import { Plus, LineChart, PieChart, Sparkles, History, TrendingUp, Info } from 'lucide-react';

export default function MoodPage() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;

        // Use real-time subscription for mood data and stats
        const unsubscribeMood = moodService.subscribeMoodData(user.uid, async () => {
            const data = await moodService.getMoodStats(user.uid);
            setStats(data);
            setLoading(false);
        });

        return () => {
            unsubscribeMood();
        };
    }, [user, authLoading]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-navy/5 rounded-full" />
                    <div className="h-4 w-32 bg-navy/5 rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 px-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-navy tracking-tight">Mood Tracker</h1>
                    <p className="text-sm text-gray-400 font-medium italic">Your emotional landscape, visualized.</p>
                </div>

                <button
                    onClick={() => setIsLogModalOpen(true)}
                    className="flex items-center gap-2 px-8 py-3.5 bg-navy text-white rounded-2xl font-bold shadow-xl shadow-navy/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                >
                    <Plus size={20} strokeWidth={3} />
                    Log Current Mood
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    icon={TrendingUp}
                    label="Average Mood"
                    value={stats?.averageLabel || 'Neutral'}
                    color="text-emerald-500"
                    bg="bg-emerald-500/5"
                    subtext="Consistently stable this week"
                />
                <StatCard
                    icon={Sparkles}
                    label="Current Streak"
                    value={`${stats?.streak || 0} Days`}
                    color="text-blue-500"
                    bg="bg-blue-500/5"
                    subtext="You're on fire! Keep it up."
                />
                <StatCard
                    icon={History}
                    label="Total Reflections"
                    value={stats?.totalEntries?.toString() || '0'}
                    color="text-purple-500"
                    bg="bg-purple-500/5"
                    subtext="Total logs since you joined"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Trends Chart */}
                <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm h-fit">
                    <MoodGraph />
                </div>

                {/* Sidebar Column: Calendar */}
                <div className="space-y-8">
                    <MoodCalendar />
                </div>
            </div>

            <div>   {/* Emora AI Insight Card */}
                <div className="p-8 rounded-[32px] bg-linear-to-br from-primary/5 to-accent/5 border border-primary/10 space-y-4 relative overflow-hidden group ">
                    <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-[0.2em]">
                        <Sparkles size={16} />
                        Emora's Weekly Insight
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg border border-primary/10 shrink-0">🤖</div>
                        <p className="text-sm text-navy/70 leading-relaxed font-medium">
                            "I've noticed you tend to feel <span className="font-bold text-[#CA5995] text-lg ">{stats?.averageLabel}</span> after journaling for more than 10 minutes.
                            Your mood seems more stable in the mornings. Maybe try a 5-minute morning reflection today?"
                        </p>
                    </div>
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
                </div>

                {/* Pro Tip */}
                <div className="flex items-start gap-3 px-4 py-2 opacity-50">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium leading-relaxed">
                        Log your mood at least twice a day for the most accurate emotional trend mapping.
                    </p>
                </div>
            </div>

            <MoodLogModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
            />
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, bg, subtext }: any) {
    return (
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4 hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${bg} ${color}`}>
                    <Icon size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">{label}</span>
            </div>
            <div className="space-y-1">
                <h3 className={`text-2xl font-black text-navy`}>{value}</h3>
                <p className="text-[10px] font-bold text-gray-400">{subtext}</p>
            </div>
        </div>
    );
}