import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    onSend: () => void;
    isLoading: boolean;
}

export default function ChatInput({
    input,
    setInput,
    onSend,
    isLoading
}: ChatInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="px-4 pb-6 lg:px-12 lg:pb-12 bg-transparent relative">
            <div className="max-w-4xl mx-auto relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-primary/10 to-accent/10 rounded-[24px] lg:rounded-[40px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                <div className="relative flex items-end gap-2 lg:gap-3 p-1.5 lg:p-2 bg-white/70 backdrop-blur-3xl border border-white/50 focus-within:border-primary/70 rounded-[24px] lg:rounded-[38px] shadow-[0_20px_20px_-20px_rgba(26,35,64,0.15)] focus-within:shadow-md transition-all duration-500">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Share what's on your mind..."
                        rows={1}
                        className="w-full bg-transparent border-none px-4 py-3 lg:py-5 lg:px-8 text-[13px] lg:text-[15px] focus:ring-0 focus:outline-none outline-none transition-all resize-none max-h-32 lg:max-h-48 custom-scrollbar text-navy placeholder:text-navy/20 font-medium placeholder:text-xs placeholder:whitespace-nowrap"
                        style={{ height: 'auto' }}
                    />
                    <button
                        onClick={() => onSend()}
                        disabled={!input.trim() || isLoading}
                        className={`p-3 lg:p-5 rounded-[18px] lg:rounded-[30px] transition-all duration-500 flex items-center justify-center group/send ${input.trim() && !isLoading
                            ? 'bg-linear-to-br from-primary to-accent text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-105'
                            : 'bg-navy/15 text-navy/50 cursor-not-allowed'
                            }`}
                    >
                        <Send size={18} className={`lg:w-5 lg:h-5 transition-transform duration-500 ${input.trim() && !isLoading ? 'group-hover:translate-x-1 group-hover:-translate-y-1' : ''}`} />
                    </button>
                </div>
                <p className="mt-4 text-center text-[9px] text-navy/20 font-black uppercase tracking-[0.2em]">
                    Emora AI · Your safe space for support and reflection
                </p>
            </div>
        </div>
    );
}
