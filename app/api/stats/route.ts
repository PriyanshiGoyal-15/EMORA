import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Mood from "@/models/Mood";
import JournalEntry from "@/models/JournalEntry";
import Conversation from "@/models/Conversation";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const userId = (session.user as any).id;

        // 1. Journal entries count
        const journalCount = await JournalEntry.countDocuments({ userId });

        // 2. AI Chats count (total messages)
        const conversations = await Conversation.find({ userId });
        const chatCount = conversations.reduce((acc, conv) => acc + (conv.messages?.length || 0), 0);

        // 3. Mood Stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const moods = await Mood.find({
            userId,
            timestamp: { $gte: thirtyDaysAgo }
        });

        // Calculate Calm Days %
        const calmMoods = ['okay', 'good', 'great'];
        const calmDaysCount = moods.filter(m => calmMoods.includes(m.mood)).length;
        const calmPercentage = moods.length > 0 ? Math.round((calmDaysCount / moods.length) * 100) : 0;

        // Calculate Avg Mood Emoji
        const moodCounts: Record<string, number> = {};
        moods.forEach(m => {
            moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
        });

        const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
        const dominantMood = sortedMoods.length > 0 ? sortedMoods[0][0] : 'okay';

        const emojiMap: Record<string, string> = {
            'low': '😞',
            'sad': '😢',
            'okay': '😐',
            'good': '😊',
            'great': '😁'
        };

        const labelMap: Record<string, string> = {
            'low': 'feeling low',
            'sad': 'a bit down',
            'okay': 'feeling okay',
            'good': 'doing well',
            'great': 'feeling great'
        };

        return NextResponse.json({
            journalCount,
            chatCount,
            calmPercentage,
            avgMood: emojiMap[dominantMood] || '😐',
            avgMoodLabel: labelMap[dominantMood] || 'okay'
        });

    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
