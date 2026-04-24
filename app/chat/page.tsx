'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DeleteModal from '@/components/DeleteModal';

// Modular Chat Components
import ChatSidebar from '@/components/Chat/ChatSidebar';
import ChatHeader from '@/components/Chat/ChatHeader';
import MessageList from '@/components/Chat/MessageList';
import ChatInput from '@/components/Chat/ChatInput';

interface Message {
    role: 'user' | 'ai';
    content: string;
    createdAt?: Date;
}

interface Conversation {
    id: string;
    title: string;
    preview: string;
    date: string;
    messages: Message[];
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-white text-navy font-bold">Loading Emora...</div>}>
            <ChatContent />
        </Suspense>
    );
}

function ChatContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const initialId = searchParams.get('id');
        fetchConversations(initialId);
    }, []);

    // Sync URL with currentConvoId
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (currentConvoId) {
            params.set('id', currentConvoId);
        } else {
            params.delete('id');
        }
        router.replace(`${pathname}?${params.toString()}`);
    }, [currentConvoId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async (autoLoadId?: string | null) => {
        try {
            const res = await fetch('/api/conversations');
            if (res.ok) {
                const data = await res.json();
                setConversations(data);

                if (autoLoadId) {
                    const target = data.find((c: Conversation) => c.id === autoLoadId);
                    if (target) {
                        setCurrentConvoId(target.id);
                        setMessages(target.messages);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    const loadConversation = (convo: Conversation) => {
        setCurrentConvoId(convo.id);
        setMessages(convo.messages);
        setIsHistoryOpen(false);
    };

    const startNewChat = () => {
        setCurrentConvoId(null);
        setMessages([]);
        setIsHistoryOpen(false);
    };

    const sendMessage = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    conversationId: currentConvoId
                }),
            });

            if (!res.ok) throw new Error("Failed to send message");

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let assistantText = '';

            setMessages(prev => [...prev, { role: 'ai', content: '' }]);

            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.conversationId) setCurrentConvoId(data.conversationId);
                            if (data.content) {
                                assistantText += data.content;
                                setMessages(prev => [
                                    ...prev.slice(0, -1),
                                    { role: 'ai', content: assistantText }
                                ]);
                            }
                        } catch (e) { }
                    }
                }
            }
            fetchConversations();
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCurrentConversation = async () => {
        if (!currentConvoId) return;
        try {
            const res = await fetch(`/api/conversations?id=${currentConvoId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setConversations(prev => prev.filter(c => c.id !== currentConvoId));
                startNewChat();
                setIsDeleteModalOpen(false);
            }
        } catch (error) {
            console.error("Error deleting conversation:", error);
        }
    };

    return (
        <div className="flex h-full bg-white text-navy overflow-hidden rounded-none lg:rounded-[32px] border-none lg:border lg:border-navy/5 relative">
            <ChatSidebar
                conversations={conversations}
                currentConvoId={currentConvoId}
                onSelect={loadConversation}
                onNewChat={startNewChat}
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                userName={session?.user?.name || 'User'}
                userEmail={session?.user?.email || ''}
            />

            <div className="flex-1 flex flex-col relative bg-[#F8FAFF] w-full">
                <ChatHeader
                    onMenuClick={() => setIsHistoryOpen(true)}
                    onNewChatMobile={startNewChat}
                    onDeleteClick={() => setIsDeleteModalOpen(true)}
                    currentConvoId={currentConvoId}
                />

                <MessageList
                    messages={messages}
                    isLoading={isLoading}
                    messagesEndRef={messagesEndRef}
                    userName={session?.user?.name?.split(' ')[0]}
                    onSuggestionClick={sendMessage}
                />

                <ChatInput
                    input={input}
                    setInput={setInput}
                    onSend={sendMessage}
                    isLoading={isLoading}
                />
            </div>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={deleteCurrentConversation}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .custom-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}