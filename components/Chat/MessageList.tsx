import React from 'react';
import { Sparkles, Wind, Check } from 'lucide-react';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    userName?: string;
    onSuggestionClick: (text: string) => void;
}

// Custom simple markdown renderer for clean therapeutic formatting
const MarkdownContent = ({ content }: { content: string }) => {
    const blocks = content.split('\n');
    let inList = false;
    let listItems: string[] = [];
    const elements: React.ReactNode[] = [];

    const formatText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-navy">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    blocks.forEach((line, index) => {
        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
        const isNumber = /^\d+\.\s/.test(line.trim());

        if (isBullet || isNumber) {
            inList = true;
            listItems.push(line.replace(/^[-*]\s|\d+\.\s/, '').trim());
        } else {
            if (inList) {
                elements.push(
                    <ul key={`list-${index}`} className="list-disc pl-5 my-2 space-y-1">
                        {listItems.map((item, i) => (
                            <li key={i} className="text-sm leading-relaxed">{formatText(item)}</li>
                        ))}
                    </ul>
                );
                inList = false;
                listItems = [];
            }
            if (line.trim()) {
                elements.push(<p key={index} className="mb-2 last:mb-0">{formatText(line)}</p>);
            }
        }
    });

    if (inList) {
        elements.push(
            <ul key="list-last" className="list-disc pl-5 my-2 space-y-1">
                {listItems.map((item, i) => (
                    <li key={i} className="text-sm leading-relaxed">{formatText(item)}</li>
                ))}
            </ul>
        );
    }

    return <div className="space-y-1">{elements}</div>;
};

export default function MessageList({ messages, isLoading, messagesEndRef, userName, onSuggestionClick }: MessageListProps) {
    const suggestions = [
        { label: "Morning Reflection", icon: Sparkles },
        { label: "Anxiety Relief", icon: Wind },
        { label: "Daily Goal", icon: Check },
    ];

    return (
        <div className="flex-1 overflow-y-auto px-4 lg:px-12 py-8 space-y-8 lg:space-y-12 custom-scrollbar scroll-smooth">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in zoom-in duration-1000">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                        <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-[40px] bg-white shadow-2xl flex items-center justify-center group">
                            <Sparkles size={32} className="text-primary animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full animate-bounce" />
                        </div>
                    </div>

                    <div className="space-y-2 max-w-sm">
                        <h3 className="text-2xl lg:text-3xl font-black text-navy/80 tracking-tight leading-none">How can Emora help?</h3>
                        <p className="text-[12px] lg:text-sm text-navy/40 font-medium leading-tight italic ">
                            "Your safe space for support, reflection & emotional clarity."
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => onSuggestionClick(s.label)}
                                className="px-3 py-1.5 bg-white border border-navy/5 hover:border-primary/20 rounded-2xl text-[10px] font-black text-navy/40 hover:text-primary hover:shadow-xl hover:shadow-primary/5 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest"
                            >
                                <s.icon size={12} className="text-primary/40" />
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-10 lg:space-y-12">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                            <div className={`flex items-center gap-2 mb-1 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${msg.role === 'user' ? 'bg-accent' : 'bg-primary'}`} />
                                <span className="text-[9px] font-black text-navy/20 uppercase tracking-[0.2em]">
                                    {msg.role === 'user' ? (userName || 'User') : 'Emora AI'}
                                </span>
                            </div>

                            <div className={`
                                max-w-[90%] md:max-w-[75%] p-3 lg:p-5 md:p-4 rounded-[32px] text-[13px] lg:text-[14px] leading-relaxed shadow-[0_10px_40px_-10px_rgba(26,35,64,0.05)]
                                ${msg.role === 'user'
                                    ? 'bg-linear-to-br from-primary to-accent text-white rounded-tr-none shadow-primary/20'
                                    : 'bg-white/70 backdrop-blur-3xl text-navy rounded-tl-none border border-white/40'
                                }
                            `}>
                                {msg.role === 'ai' ? (
                                    <MarkdownContent content={msg.content} />
                                ) : (
                                    <div className="font-medium">{msg.content}</div>
                                )}
                            </div>

                            {idx === messages.length - 1 && msg.role === 'ai' && msg.content.toLowerCase().includes('spiral') && (
                                <div className="flex flex-wrap gap-2 pt-4">
                                    <button
                                        onClick={() => onSuggestionClick("4-7-8 breathing")}
                                        className="px-5 py-3 bg-white/50 backdrop-blur-md border border-navy/5 rounded-2xl text-[10px] font-black text-navy/40 uppercase tracking-widest hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all flex items-center gap-2"
                                    >
                                        <Wind size={14} className="text-primary" />
                                        Focus Breathing
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isLoading && (
                <div className="flex flex-col items-start space-y-3 animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 mb-1 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black text-navy/20 uppercase tracking-[0.2em]">Emora is thinking...</span>
                    </div>
                    <div className="bg-white/50 backdrop-blur-md text-navy px-6 py-4 rounded-[32px] rounded-tl-none border border-white/40 shadow-sm flex items-center gap-4">
                        <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-[11px] text-navy/40 font-black uppercase tracking-widest">Processing</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
        </div>
    );
}
