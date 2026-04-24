import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import JournalEntry from "@/models/JournalEntry";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        await connectDB();

        const entries = await JournalEntry.find({ userId }).sort({ timestamp: -1 });

        if (entries.length > 0) {
            console.log('DEBUG: Found entries for user', userId, 'Count:', entries.length);
            console.log('DEBUG: First entry ID:', entries[0]._id.toString());
        } else {
            console.log('DEBUG: No entries found for user', userId);
        }

        return NextResponse.json(entries);
    } catch (error: any) {
        console.error("Journal GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();

        // Basic validation
        if (!body.title || !body.content || !body.mood) {
            return NextResponse.json({ error: "Title, content, and mood are required" }, { status: 400 });
        }

        await connectDB();

        const newEntry = await JournalEntry.create({
            userId,
            title: body.title,
            content: body.content,
            mood: body.mood,
            intensity: body.intensity || 5,
            tags: body.tags || [],
            status: body.status || 'published',
            metadata: {
                weather: body.weather,
                location: body.location,
                visibility: body.visibility || 'Private',
            },
            timestamp: body.timestamp || new Date(),
        });

        console.log('DEBUG: Created New Entry', { 
            id: newEntry._id.toString(), 
            userId: newEntry.userId.toString(),
            title: newEntry.title 
        });

        return NextResponse.json(newEntry, { status: 201 });
    } catch (error: any) {
        console.error("Journal POST Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
