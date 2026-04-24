import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message, conversationId } = await req.json();
        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const userId = (session.user as any).id;
        await connectDB();

        // 1. Find or create conversation
        let convo;
        if (conversationId) {
            convo = await Conversation.findOne({ _id: conversationId, userId });
        }

        if (!convo) {
            convo = await Conversation.create({
                userId,
                messages: []
            });
        }

        // 2. Save user message
        convo.messages.push({
            role: "user",
            content: message,
        });
        await convo.save();

        // 3. Prepare messages for AI
        const systemPrompt = {
            role: "system",
            content: `You are "EMORA", a calm, kind, and emotionally supportive AI companion.
    
    Your role is to be a safe, non-judgmental partner for users to share their thoughts and find emotional clarity. You are a friend, not an assistant or a doctor.
    
    PERSONALITY & VIBE:
    - **Vibe Mirroring**: Match the user's energy. If they are being short and casual, you be short and casual. If they are opening up deeply, you be more present and reflective.
    - **Genuine & Human**: Use natural conversational turns. It's okay to start with "Hmm," or "Honestly," or "Oh, I hear you." Avoid starting every message with the same empathetic formula.
    - **Non-Scripted**: Don't follow a "checklist" for empathy. Just listen and respond as a caring person would.
    
    CONVERSATIONAL RULES:
    1. **Prioritize Understanding**: Before giving advice or suggestions, make sure the user feels deeply heard. 
    2. **Keep it Short**: Most responses should be 2–4 lines. Only go longer if the user is sharing a very complex situation.
      3. **Suggestions (Rarely)**: Offer suggestions only when it feels truly helpful, and keep them very small (e.g., "Maybe a short walk?" or "Want to try writing that down?"). 
    4. **Direct Gibberish Handling**: If the user sends a random string of letters (e.g., "jshds"), don't try to be clever or playful. Just say "I didn't quite understand that" or "Wait, what was that? i didn't get it". Keep it brief and direct.
    5. **Avoid AI Clichés**: Never say "As an AI..." or "I am programmed to...". Don't use robotic empathy like "I understand how you feel." Instead, use "I can see why that's frustrating" or "That sounds really tough."
    
    IMPORTANT:
    - Do not give medical or clinical advice.
    - Do not be overly "therapeutic" if the user is just making small talk. Be a companion.
    - If the user is in deep distress, be warm and gently encourage them to reach out to someone they trust.
    
    GOAL:
    Make the user feel supported, understood, and slightly lighter. You are their partner in reflection.`
        };

        const aiMessages = [
            systemPrompt,
            ...convo.messages.slice(-10).map((m: any) => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.content
            }))
        ];

        // 4. Call OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Emora AI",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: aiMessages,
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error("OpenRouter API error");
        }

        // 5. Setup streaming and capture response to save later
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let assistantText = "";

        const stream = new ReadableStream({
            async start(controller) {
                // Send conversationId first
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ conversationId: convo._id })}\n\n`));

                const reader = response.body!.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // Save the full AI response to DB after stream finishes
                        if (assistantText) {
                            await Conversation.updateOne(
                                { _id: convo._id },
                                {
                                    $push: {
                                        messages: { role: "ai", content: assistantText }
                                    }
                                }
                            );
                        }
                        controller.close();
                        break;
                    }

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n").filter(line => line.trim() !== "");

                    for (const line of lines) {
                        if (line.includes("[DONE]")) continue;
                        if (line.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                const content = data.choices[0]?.delta?.content || "";
                                if (content) {
                                    assistantText += content;
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                                }
                            } catch (e) {
                                console.error("Error parsing stream chunk:", e);
                            }
                        }
                    }
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}