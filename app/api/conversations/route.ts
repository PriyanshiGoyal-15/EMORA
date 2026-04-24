import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        await connectDB();

        const conversations = await Conversation.find({ userId })
            .sort({ updatedAt: -1 })
            .select('messages updatedAt')
            .lean();

        const formattedConversations = conversations.map((convo: any) => {
            const firstMessage = convo.messages[0]?.content || "New conversation";
            const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;

            return {
                id: convo._id,
                title: title,
                preview: convo.messages[convo.messages.length - 1]?.content || "",
                date: convo.updatedAt,
                messages: convo.messages
            };
        });

        return NextResponse.json(formattedConversations);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const userId = (session.user as any).id;
        await connectDB();

        const result = await Conversation.deleteOne({ _id: id, userId });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Conversation not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
