import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Mood from "@/models/Mood";
import mongoose from "mongoose";

const MOOD_INTENSITY: Record<string, number> = {
    'low': 40,
    'sad': 55,
    'okay': 72,
    'good': 85,
    'great': 100
};

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const userId = (session.user as any).id;

        // Calculate time window (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // 1. Get breakdown stats (filtered for last 7 days)
        const breakdown = await Mood.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    timestamp: { $gte: sevenDaysAgo }
                }
            },
            { $group: { _id: "$mood", count: { $sum: 1 }, label: { $first: "$label" } } }
        ]);

        // 2. Get history for last 7 days
        const moodsLastSevenDays = await Mood.find({
            userId,
            timestamp: { $gte: sevenDaysAgo }
        }).sort({ timestamp: 1 });

        // Process history into days
        const daysData = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            // Find moods for this specific day
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const dayMoods = moodsLastSevenDays.filter(m =>
                m.timestamp >= startOfDay && m.timestamp <= endOfDay
            );

            if (dayMoods.length === 0) {
                daysData.push({
                    day: dayName,
                    height: '0%',
                    active: false,
                    segments: []
                });
                continue;
            }

            // Calculate segments
            const moodCounts: Record<string, number> = {};
            let maxIntensity = 0;
            dayMoods.forEach(m => {
                moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
                maxIntensity = Math.max(maxIntensity, MOOD_INTENSITY[m.mood]);
            });

            const segments = Object.entries(moodCounts).map(([mood, count]) => ({
                mood,
                percentage: (count / dayMoods.length) * 100
            })).sort((a, b) => MOOD_INTENSITY[b.mood] - MOOD_INTENSITY[a.mood]); // Sort by intensity

            daysData.push({
                day: dayName,
                height: `${maxIntensity}%`,
                active: date.toDateString() === new Date().toDateString(),
                segments
            });
        }

        // 3. Get recent logs
        const recentLogs = await Mood.find({ userId })
            .sort({ timestamp: -1 })
            .limit(3);

        // 4. Get total count of all time
        const totalLogsCount = await Mood.countDocuments({ userId });

        // 5. Get the latest mood overall for the selector
        const latestEntry = await Mood.findOne({ userId }).sort({ timestamp: -1 });

        return NextResponse.json({
            currentMood: latestEntry?.mood || null,
            totalLogs: totalLogsCount,
            calendar: await getMonthlyCalendar(userId),
            breakdown,
            history: daysData,
            logs: recentLogs.map(l => ({
                text: l.note || `Feeling ${l.label}`,
                mood: l.label,
                timestamp: l.timestamp,
                type: l.mood
            }))
        });
    } catch (error) {
        console.error("Error fetching mood data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { mood, label, note } = await req.json();

        if (!mood || !label) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        const newMood = await Mood.create({
            userId: (session.user as any).id,
            mood,
            label,
            note,
            timestamp: new Date()
        });

        return NextResponse.json(newMood, { status: 201 });
    } catch (error) {
        console.error("Error saving mood:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

async function getMonthlyCalendar(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const moods = await Mood.find({
        userId,
        timestamp: { $gte: startOfMonth }
    });

    const calendar: Record<number, string[]> = {};
    moods.forEach(m => {
        const day = new Date(m.timestamp).getDate();
        if (!calendar[day]) calendar[day] = [];
        calendar[day].push(m.mood);
    });

    return calendar;
}
