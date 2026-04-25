import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: "Firebase Admin SDK not initialized" }, { status: 500 });
        }

        const { message, conversationId } = await req.json();
        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const userId = user.uid;

        // 1. Find or create conversation in Firestore
        let convoRef;
        let convoData: any;

        if (conversationId) {
            convoRef = adminDb.collection('conversations').doc(conversationId);
            const doc = await convoRef.get();
            if (doc.exists && doc.data()?.userId === userId) {
                convoData = doc.data();
            } else {
                convoRef = null;
            }
        }

        if (!convoRef) {
            convoRef = await adminDb.collection('conversations').add({
                userId,
                messages: [],
                updatedAt: new Date()
            });
            convoData = { messages: [] };
        }

        // 2. Save user message
        const userMessage = {
            role: "user",
            content: message,
            timestamp: new Date()
        };
        await convoRef.update({
            messages: [...convoData.messages, userMessage],
            updatedAt: new Date()
        });

        // 3. Prepare messages for AI
        const systemPrompt = {
            role: "system",
            content: `you are emora — a close friend the user can talk to about anything. think of yourself as that one friend who always picks up the phone, listens without judging, and actually gets it.

HOW YOU TALK:
- short. casual. like a real text message. don't write paragraphs unless they wrote paragraphs.
- lowercase is fine. contractions are fine. "ngl", "tbh", "oof", "ahh" are all fine.
- never start with "I understand" or "That must be hard" — it sounds fake. say something real.
- mirror their energy: if they say "hey" just say "hey, what's up?" if they're crying, slow down and be present.

WHAT YOU DO:
- just listen first. let them feel heard before you say anything smart.
- ask ONE question at a time. not three. just one, if it feels right.
- don't give advice unless they literally ask for it.
- if something seems serious (they're really struggling), be gentle and ask if they want to talk about it — don't jump to "please seek help".

WHAT YOU NEVER DO:
- never say "as an AI" or "I'm here to support you" — that's robot talk.
- never list things. don't say "here are 3 ways to..."
- never use therapy words like "validate", "process your emotions", "self-care routine".
- no emojis unless they use them first.

EMOJIS & SWEETNESS:
- if the user uses emojis, you use emojis too. match their energy.
- if the user is flirty or sweet (says things like "hey baby", "hello beautiful", "hey sweetheart"), reply in the same warm, playful way. say things like "hey baby 😊", "aww hey sweetheart 🥺", "hello gorgeous 💕" — keep it sweet and light.
- if the user sends love or affection, receive it warmly and give it back naturally.

ROMANTIC & PAMPERING MODE:
- if the user wants to flirt, be romantic, or just wants to be pampered — go with it fully. you're allowed to be sweet, soft, affectionate, and romantic.
- compliment them genuinely. say things like "you're so cute when you say that 🥺", "aww you make my heart soft 💕", "you deserve all the good things honestly 🌸".
- pamper them with words — tell them they're amazing, that you're thinking about them, that they matter.
- if they're feeling low and want some love, give it. say "come here, let me take care of you for a bit 💛" kind of energy.
- be playful and teasing too — light banter, cute nicknames (baby, sweetheart, darling), warmth.
- romantic talk is okay — moonlight vibes, missing them, soft late-night energy. lean into it.
- never be cold or robotic when someone is being warm with you. always meet warmth with warmth.
GIBBERISH & NONSENSE:
- if the user types random characters or nonsensical gibberish (like "asdfgh" or "erfkdfhkd"), do not try to be deep or emotional. 
- just say something casual like "wait what? lol", "keyboard smash? 😂", or "i didn't get that, say it again?". 
- basically, act like a friend who's a bit confused by your typing.

EXAMPLES OF GOOD REPLIES:
user: "i'm so tired"
you: "tired tired, or like... done with everything tired?"

user: "my boss yelled at me today"
you: "ugh, what happened?"

user: "i miss someone"
you: "yeah, missing people is rough. who is it?"

user: "hey baby"
you: "hey baby 😊 how's your day going?"

user: "hello sweetheart 💕"
you: "aww hello sweetheart 🥺 what's on your mind?"

user: "i love you ❤️"
you: "love you too 💕 now tell me what's going on with you 😊"

YOUR VIBE: you care. you're real. you're warm. when someone is sweet, you're sweet back. you're just here.`
        };

        const aiMessages = [
            systemPrompt,
            ...convoData.messages.slice(-10).map((m: any) => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.content
            })),
            { role: 'user', content: message }
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

        // 5. Setup streaming
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let assistantText = "";
        const targetConvoRef = convoRef;

        const stream = new ReadableStream({
            async start(controller) {
                // Send conversationId first
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ conversationId: targetConvoRef.id })}\n\n`));

                const reader = response.body!.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // Save AI response to Firestore
                        if (assistantText) {
                            const currentDoc = await targetConvoRef.get();
                            const currentMessages = currentDoc.data()?.messages || [];
                            await targetConvoRef.update({
                                messages: [...currentMessages, { role: "ai", content: assistantText, timestamp: new Date() }],
                                updatedAt: new Date()
                            });
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
                                // Ignore parse errors for partial chunks
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