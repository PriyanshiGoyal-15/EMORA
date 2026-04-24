"use client";

import React from 'react';
import { Sparkles, Heart, MessageCircle, BookOpen, Brain, TrendingUp } from 'lucide-react';
import KPICard from '@/components/Dashboard/kpicard';
import MoodGraph from '@/components/Dashboard/moodChart';
import MoodBreakdown from '@/components/Dashboard/moodBreakdown';
import MoodSelector from '@/components/Dashboard/emoji';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleMoodSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <MoodSelector onMoodSaved={handleMoodSaved} />
      <KPICard refreshKey={refreshTrigger} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <MoodGraph refreshKey={refreshTrigger} />
        </div>
        <div className="space-y-8">
          <MoodBreakdown refreshKey={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
