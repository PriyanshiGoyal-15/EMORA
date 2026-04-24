'use client';

import React, { useState, useEffect } from 'react';

interface CalendarDay {
    date: string;
    moods: string[];
}

export default function MoodCalendar() {
    const [days, setDays] = useState<CalendarDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const MOOD_COLORS: Record<string, string> = {
        'low': 'bg-purple-300',
        'sad': 'bg-orange-300',
        'okay': 'bg-amber-300',
        'good': 'bg-emerald-300',
        'great': 'bg-blue-300'
    };

    // Helper to get background class based on moods
    const getBgClass = (moods: string[]) => {
        if (moods.length === 0) return 'bg-gray-50 text-gray-300';
        if (moods.length === 1) return MOOD_COLORS[moods[0]] || 'bg-gray-200';

        // Multiple moods: Create a gradient between the first and last mood
        const firstMood = moods[0];
        const lastMood = moods[moods.length - 1];

        // We'll use a mapping for gradients since Tailwind needs full class names
        const gradientMap: Record<string, string> = {
            'low-sad': 'bg-linear-to-br from-purple-300 to-orange-300',
            'low-okay': 'bg-linear-to-br from-purple-300 to-amber-300',
            'low-good': 'bg-linear-to-br from-purple-300 to-emerald-300',
            'low-great': 'bg-linear-to-br from-purple-300 to-blue-300',
            'sad-okay': 'bg-linear-to-br from-orange-300 to-amber-300',
            'sad-good': 'bg-linear-to-br from-orange-300 to-emerald-300',
            'sad-great': 'bg-linear-to-br from-orange-300 to-blue-300',
            'okay-good': 'bg-linear-to-br from-amber-300 to-emerald-300',
            'okay-great': 'bg-linear-to-br from-amber-300 to-blue-300',
            'good-great': 'bg-linear-to-br from-emerald-300 to-blue-300',
        };

        const combo = `${firstMood}-${lastMood}`;
        const reverseCombo = `${lastMood}-${firstMood}`;

        return gradientMap[combo] || gradientMap[reverseCombo] || 'bg-linear-to-br from-primary/30 to-accent/30';
    };

    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                const res = await fetch('/api/mood');
                const data = await res.json();

                if (res.ok && data.calendar) {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = now.getMonth();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();

                    const generatedDays: CalendarDay[] = [];
                    for (let i = 1; i <= daysInMonth; i++) {
                        generatedDays.push({
                            date: `${year}-${month + 1}-${i}`,
                            moods: data.calendar[i] || []
                        });
                    }
                    setDays(generatedDays);
                }
            } catch (error) {
                console.error('Error fetching calendar data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCalendarData();
    }, []);

    const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

    return (
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-navy">{monthName} Mood Grid</h3>
                <div className="flex gap-2">
                    {Object.entries(MOOD_COLORS).map(([mood, color]) => (
                        <div key={mood} className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-sm ${color}`} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-7 gap-3">
                {days.map((day, idx) => (
                    <div
                        key={idx}
                        className={`aspect-square rounded-lg border border-gray-50 flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 cursor-pointer ${getBgClass(day.moods)}`}
                        title={`${day.date} (${day.moods.length} reflections)`}
                    >
                        {idx + 1}
                    </div>
                ))}
            </div>

            <p className="text-[11px] text-gray-500 font-medium text-center">
                Your "Year in Pixels" view. Gradient squares show days with multiple reflections.
            </p>
        </div>
    );
}
