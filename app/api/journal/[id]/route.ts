import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import JournalEntry from "@/models/JournalEntry";
import mongoose from "mongoose";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: entryId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        await connectDB();

        const deletedEntry = await JournalEntry.findOneAndDelete({
            _id: entryId,
            userId, // Crucial: Ensure only the owner can delete
        });

        if (!deletedEntry) {
            return NextResponse.json({ error: "Entry not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Journal DELETE Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: entryId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const updates = await req.json();

        await connectDB();

        // Find entry and check ownership
        const entry = await JournalEntry.findOne({ _id: entryId, userId });

        if (!entry) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }

        // Proceed with update
        const updatedEntry = await JournalEntry.findByIdAndUpdate(
            entryId,
            { $set: updates },
            { new: true }
        );

        return NextResponse.json(updatedEntry);
    } catch (error: any) {
        console.error("Journal PATCH Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
