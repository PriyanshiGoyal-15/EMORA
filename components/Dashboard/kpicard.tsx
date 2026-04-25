import React, { useEffect, useState } from 'react'
import { Heart, BookOpen, MessageCircle, Smile, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { moodService } from '@/lib/firestore-service'

const kpicard = ({ refreshKey }: { refreshKey?: number }) => {
    const { user, loading: authLoading } = useAuth();
    const [statsData, setStatsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;

        const unsubscribe = moodService.subscribeGlobalStats(user.uid, (data) => {
            setStatsData(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-100 rounded w-1/2" />
                            <div className="h-3 bg-gray-50 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            name: 'Calm days',
            value: `${statsData?.calmPercentage || 0}%`,
            trend: 'Last 30 days',
            icon: Heart,
            color: 'text-success',
            bg: 'bg-success/5',
            trendColor: 'text-gray-400',
            isEmoji: false
        },
        {
            name: 'AVG. MOOD',
            value: statsData?.avgMood || '😐',
            trend: statsData?.avgMoodLabel || 'feeling okay',
            icon: Smile,
            color: 'text-amber-500',
            bg: 'bg-amber-500/5',
            trendColor: 'text-amber-500',
            isEmoji: true
        },
        {
            name: 'Journal entries',
            value: statsData?.journalCount?.toString() || '0',
            trend: 'Total entries',
            icon: BookOpen,
            color: 'text-primary',
            bg: 'bg-primary/5',
            trendColor: 'text-gray-400',
            isEmoji: false
        },
        {
            name: 'AI Chats',
            value: statsData?.chatCount?.toString() || '0',
            trend: 'Total messages',
            icon: MessageCircle,
            color: 'text-accent',
            bg: 'bg-accent/5',
            trendColor: 'text-gray-400',
            isEmoji: false
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {cards.map((stat) => (
                <div key={stat.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow h-full">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            {stat.isEmoji ? (
                                <span className="text-2xl font-bold">{stat.value}</span>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</p>
                            )}
                        </div>
                        <p className="text-sm font-medium text-gray-500 mt-1">{stat.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${stat.trendColor}`}>{stat.trend}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default kpicard