'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Bold, Italic, Underline, List, Heading1, Heading2, Quote, Link, Check, PlusCircle,
    ListOrdered, ChevronLeft, Plus, X, PenLine
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { journalService } from '@/lib/firestore-service';
import { useAuth } from '@/context/AuthContext';

interface NewEntryJournalProps {
    isOpen: boolean;
    onClose: () => void;
    editEntry?: any; // If provided, we are in edit mode
}

export default function NewEntryJournal({ isOpen, onClose, editEntry }: NewEntryJournalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [activeMood, setActiveMood] = useState('Okay');
    const [intensity, setIntensity] = useState(5);
    const [tags, setTags] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'insights'>('editor');
    const [showHeader, setShowHeader] = useState(true);
    const [isPromptsOpen, setIsPromptsOpen] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [, setUpdateTick] = useState(0); // Force re-render for toolbar

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Tag adding state
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTagInput, setNewTagInput] = useState('');
    const tagInputRef = useRef<HTMLInputElement>(null);

    // Scroll listener for auto-hiding header
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (window.innerWidth >= 768) {
            setShowHeader(true);
            return;
        }
        const currentScrollY = e.currentTarget.scrollTop;
        if (currentScrollY > lastScrollY && currentScrollY > 60) {
            setShowHeader(false);
        } else {
            setShowHeader(true);
        }
        setLastScrollY(currentScrollY);
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2],
                },
                blockquote: {},
            }),
            UnderlineExtension,
            LinkExtension.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder: 'Start writing your soul out...',
            }),
        ],
        content: '',
        immediatelyRender: false,
        onUpdate: () => setUpdateTick(t => t + 1),
        onSelectionUpdate: () => setUpdateTick(t => t + 1),
        onTransaction: () => setUpdateTick(t => t + 1),
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-navy max-w-none min-h-[300px] text-base lg:text-lg text-navy/70 leading-relaxed focus:outline-none font-medium',
            },
        },
    });

    // Initialize states if editing
    useEffect(() => {
        if (editEntry && editor) {
            setTitle(editEntry.title || '');
            editor.commands.setContent(editEntry.content || '');
            setActiveMood(editEntry.mood || 'Okay');
            setIntensity(editEntry.intensity || 5);
            setTags(editEntry.tags || []);
        } else if (isOpen && editor) {
            // Reset for new entry
            setTitle('');
            editor.commands.setContent('');
            setActiveMood('Okay');
            setIntensity(5);
            setTags(['Anxious', 'Exams']);
        }
    }, [editEntry, isOpen, editor]);

    useEffect(() => {
        if (isAddingTag && tagInputRef.current) {
            tagInputRef.current.focus();
        }
    }, [isAddingTag]);

    const moods = [
        { name: 'Low', emoji: '😞' },
        { name: 'Sad', emoji: '😢' },
        { name: 'Okay', emoji: '😐' },
        { name: 'Good', emoji: '😊' },
        { name: 'Great', emoji: '😁' },
    ];

    const prompts = [
        "What triggered this feeling?",
        "What do I need right now?",
        "What can I control?",
        "One thing I'm grateful for...",
        "What would I tell a friend?",
        "How does my body feel?"
    ];

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const handleAction = async (status: 'published' | 'draft') => {
        if (!title || !editor || editor.isEmpty || !user) return;

        setIsSaving(true);
        try {
            const id = editEntry?._id || editEntry?.id;
            
            const entryData = {
                title,
                content: editor.getHTML(),
                mood: activeMood,
                intensity,
                tags,
                status
            };

            if (id) {
                await journalService.updateEntry(id, entryData);
            } else {
                await journalService.addEntry(user.uid, entryData);
            }

            onClose();
            window.location.reload();
        } catch (error: any) {
            console.error('Save Error:', error);
            alert('Failed to save entry: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const addTag = () => {
        const trimmed = newTagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setNewTagInput('');
            setIsAddingTag(false);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-[#f8faff] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden text-navy">
            {/* Header Navigation */}
            <header className={`h-16 px-6 lg:px-10 border-b border-navy/5 flex items-center justify-between bg-white/50 backdrop-blur-md shrink-0 transition-all duration-300 ${showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-navy/50 hover:text-navy font-bold text-xs transition-colors group disabled:opacity-50"
                    >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back to Journal</span>
                    </button>
                    <div className="h-4 w-px bg-navy/10 hidden md:block" />
                    <span className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em] hidden lg:block">
                        {editEntry ? 'Edit Reflection' : 'New Entry Editor'}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleAction('draft')}
                        disabled={isSaving}
                        className="px-4 md:px-5 py-2 text-navy/60 hover:bg-navy/5 rounded-xl font-bold text-[10px] md:text-xs transition-all disabled:opacity-50"
                    >
                        {isSaving ? '...' : 'Draft'}
                    </button>
                    <button
                        onClick={() => handleAction('published')}
                        disabled={isSaving}
                        className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-[10px] md:text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 md:gap-2 disabled:opacity-50 disabled:scale-100"
                    >
                        {isSaving ? '...' : editEntry ? 'Update' : 'Publish +'}
                    </button>
                </div>
            </header>

            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex p-1.5 bg-white border-b border-navy/5 shrink-0">
                <button
                    onClick={() => setActiveTab('editor')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-navy text-white shadow-md' : 'text-navy/30'}`}
                >
                    Editor
                </button>
                <button
                    onClick={() => setActiveTab('insights')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'insights' ? 'bg-navy text-white shadow-md' : 'text-navy/30'}`}
                >
                    Details & Insights
                </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Left Column: The Editor */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col transition-all duration-300 ${activeTab === 'editor' ? 'flex' : 'hidden md:flex'}`}
                >
                    <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-4 md:py-4 space-y-2 md:space-y-6">
                        {/* The Canvas */}
                        <div className="bg-white rounded-[40px] md:rounded-[60px] shadow-[0_20px_70px_-10px_rgba(26,35,64,0.1)] border border-navy/5 p-6 md:p-20 min-h-[calc(100vh-250px)] relative overflow-hidden group/canvas">
                            {/* Paper texture/gradient overlay */}
                            <div className="absolute inset-0 bg-linear-to-b from-white via-white/50 to-navy/5 opacity-50 pointer-events-none" />

                            {/* Meta Info */}
                            <div className="relative flex items-center gap-3 text-[10px] font-black text-navy/20 uppercase tracking-[0.3em] mb-8">
                                <div className="w-8 h-px bg-navy/10" />
                                {today} · {time}
                            </div>

                            {/* Title Section */}
                            <div className="relative mb-8 group/title">
                                <input
                                    type="text"
                                    placeholder="Heart's Echo..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full text-3xl lg:text-5xl font-black text-navy bg-white/40  border border-blue-100 rounded-[28px] lg:rounded-[36px] p-6 lg:p-10 focus:ring-0 focus:outline-none outline-none placeholder:text-navy/15 tracking-tighter transition-all focus:bg-white focus:border-blue-100"
                                />
                                <div className="h-1.5 w-24 bg-primary/20 rounded-full mt-4 group-focus-within/title:w-80 group-focus-within/title:bg-primary transition-all duration-700" />
                            </div>

                            {/* Writing Prompts - Integrated more elegantly */}
                            <div className="relative mb-16">
                                <div className="flex items-center gap-2 text-[9px] font-black text-navy/30 uppercase tracking-[0.2em] mb-4">
                                    <Plus size={12} className="text-primary" />
                                    Guided Prompts
                                </div>
                                <div className="flex flex-wrap gap-2 md:gap-3">
                                    {prompts.map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => {
                                                if (editor) {
                                                    editor.chain().focus().insertContent((editor.isEmpty ? '' : '\n\n') + prompt).run();
                                                }
                                            }}
                                            className="px-4 py-2 bg-navy/5 hover:bg-white hover:shadow-lg hover:shadow-navy/5 border border-transparent hover:border-navy/5 rounded-full text-[10px] font-bold text-navy/50 hover:text-primary transition-all active:scale-95"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative group/editor">
                                <div className="absolute -inset-x-4 -inset-y-4 md:-inset-x-8 md:-inset-y-6 border border-primary/20 rounded-[24px] md:rounded-[32px] pointer-events-none group-focus-within/editor:border-primary/20 group-focus-within/editor:bg-navy/[0.02] transition-all duration-700 ease-out" />
                                <div className="absolute -top-8 md:-top-10 right-0 flex items-center gap-2 text-[8px] md:text-[9px] font-black text-primary/40 uppercase tracking-widest transition-all duration-500">
                                    <PenLine size={10} className="md:size-3" />
                                    Writing Mode Active
                                </div>
                                <div className="relative prose prose-navy max-w-none">
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`sticky bottom-0 h-14 md:h-16 bg-white/80 backdrop-blur-xl border-t border-navy/5 px-4 md:px-6 flex items-center justify-between shrink-0 transition-transform duration-300 ${showHeader ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>
                        <div className="flex items-center gap-1 md:gap-4  overflow-x-auto no-scrollbar">
                            <ToolbarButton
                                icon={Bold}
                                onClick={() => editor?.chain().focus().toggleBold().run()}
                                isActive={editor?.isActive('bold')}
                            />
                            <ToolbarButton
                                icon={Italic}
                                onClick={() => editor?.chain().focus().toggleItalic().run()}
                                isActive={editor?.isActive('italic')}
                            />
                            <ToolbarButton
                                icon={Underline}
                                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                isActive={editor?.isActive('underline')}
                            />
                            <ToolbarButton
                                icon={Heading1}
                                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                                isActive={editor?.isActive('heading', { level: 1 })}
                            />
                            <ToolbarButton
                                icon={Heading2}
                                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                                isActive={editor?.isActive('heading', { level: 2 })}
                            />
                            <ToolbarButton
                                icon={List}
                                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                isActive={editor?.isActive('bulletList')}
                            />
                            <ToolbarButton
                                icon={ListOrdered}
                                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                isActive={editor?.isActive('orderedList')}
                            />
                            <ToolbarButton
                                icon={Quote}
                                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                                isActive={editor?.isActive('blockquote')}
                            />
                            {/* <ToolbarButton
                                icon={Link}
                                onClick={() => {
                                    const url = window.prompt('URL');
                                    if (url) editor?.chain().focus().setLink({ href: url }).run();
                                }}
                                isActive={editor?.isActive('link')}
                            /> */}
                            {/* Mobile Prompts Trigger */}
                            <button
                                onClick={() => setIsPromptsOpen(true)}
                                className="md:hidden w-10 h-10 flex items-center justify-center rounded-2xl text-primary bg-primary/10 shrink-0 hover:bg-primary/20 transition-colors"
                            >
                                <Plus size={18} />
                            </button>

                            {/* Stats */}
                            <div className="hidden lg:flex flex-col items-end gap-0.5 ml-auto border-l border-navy/10 pl-4 shrink-0">
                                <div className="flex items-center gap-3 text-[9px] font-black text-navy/20 uppercase tracking-[0.2em]">
                                    <span>{(editor?.getText() || '').split(/\s+/).filter(x => x.length > 0).length} Words</span>
                                    <span>{Math.ceil(((editor?.getText() || '').split(/\s+/).filter(x => x.length > 0).length) / 200)}m Read</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Insights & Details Sidebar */}
                <div className={`w-full md:w-[380px] md:border-l border-navy/5 bg-white/40 backdrop-blur-3xl overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8 md:space-y-10 ${activeTab === 'insights' ? 'block' : 'hidden md:block'}`}>
                    {/* Mood Selector */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em]">How are you feeling?</h4>
                        <div className="flex items-center justify-between bg-black/5 p-1 rounded-2xl">
                            {moods.map((m) => (
                                <button
                                    key={m.name}
                                    onClick={() => setActiveMood(m.name)}
                                    className={`flex flex-col items-center gap-1 flex-1 py-3 rounded-xl transition-all ${activeMood === m.name
                                        ? 'bg-white shadow-xl scale-105 shadow-navy/5 text-navy'
                                        : 'hover:bg-white/40 text-navy/40 hover:text-navy/60'
                                        }`}
                                >
                                    <span className={`text-xl ${activeMood === m.name ? '' : 'filter grayscale-xs opacity-85'}`}>{m.emoji}</span>
                                    <span className="text-[9px] font-black uppercase tracking-wider">{m.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Tag Cloud */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em]">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => removeTag(tag)}
                                    className="group px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-bold flex items-center gap-2 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                >
                                    {tag}
                                    <X size={10} className="opacity-40 group-hover:opacity-100" />
                                </button>
                            ))}

                            {isAddingTag ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={tagInputRef}
                                        type="text"
                                        value={newTagInput}
                                        onChange={(e) => setNewTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                        onBlur={() => !newTagInput && setIsAddingTag(false)}
                                        placeholder="Tag name..."
                                        className="w-24 px-2 py-1 bg-white border border-primary/30 rounded-lg text-[10px] font-bold focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    <button onClick={addTag} className="p-1 text-primary hover:bg-primary/10 rounded-md">
                                        <Check size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingTag(true)}
                                    className="px-3 py-1 bg-navy/5 text-navy/40 border border-navy/5 rounded-lg text-[10px] font-bold hover:bg-navy/10 transition-colors flex items-center gap-1.5"
                                >
                                    <PlusCircle size={12} />
                                    Add tag
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Entry Details Table */}
                    <section className="space-y-2">
                        <h4 className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em]">Entry Details</h4>
                        <div className="bg-white/50 border border-navy/5 rounded-2xl overflow-hidden divide-y divide-navy/5">
                            <DetailRow label="Date" value={today} />
                            <DetailRow label="Time" value={time} />
                            <DetailRow label="Status" value={editEntry?.status || 'New'} isAction />
                        </div>
                    </section>

                    {/* AI Insights (Emora) */}
                    <section className="p-5 rounded-[24px] bg-linear-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 space-y-3 relative overflow-hidden group">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                            <Plus size={14} />
                            Emora's Early Read
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs border border-indigo-100 shrink-0">🤖</div>
                            <p className="text-[11px] text-gray-600  leading-relaxed font-medium">
                                {(editor?.getText().length || 0) < 50
                                    ? "Start writing more to unlock deeper insights into your thoughts..."
                                    : "I'm noticing your writing is gathering depth. Reflecting on these specific emotions helps clarify the 'why' behind them."}
                            </p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-500/10 blur-2xl rounded-full" />
                    </section>

                    {/* Intensity Level */}
                    {/* <section className="space-y-4">
                        <h4 className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em]">Intensity Level</h4>
                        <div className="space-y-2">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={intensity}
                                onChange={(e) => setIntensity(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-navy/5 rounded-full appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-[10px] font-bold text-navy/30 uppercase tracking-widest">
                                <span>Mild</span>
                                <span className={intensity > 7 ? 'text-accent' : ''}>Intense → {intensity}/10</span>
                            </div>
                        </div>
                    </section> */}
                </div>
            </div>

            <style jsx global>{`
                .tiptap p.is-editor-empty:first-child::before {
                    color: rgba(26, 35, 64, 0.3);
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .tiptap {
                    outline: none !important;
                }
                .tiptap p {
                    margin: 0;
                }
                .tiptap h1 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                    line-height: 1.2;
                }
                  .tiptap ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
            }
                    .tiptap ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
            }
                .tiptap h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-top: 1.25rem;
                    margin-bottom: 0.75rem;
                    line-height: 1.3;
                }
                .tiptap blockquote {
                    border-left: 4px solid #4F46E5;
                    padding: 0.5rem 0 0.5rem 1.5rem;
                    font-style: italic;
                    color: rgba(26, 35, 64, 0.6);
                    background: rgba(79, 70, 229, 0.03);
                    margin: 1.5rem 0;
                    border-radius: 0 8px 8px 0;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(26, 35, 64, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(26, 35, 64, 0.1); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Mobile Prompts Drawer */}
            {isPromptsOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-navy/20 backdrop-blur-sm z-[250] md:hidden animate-in fade-in"
                        onClick={() => setIsPromptsOpen(false)}
                    />
                    <div className="fixed bottom-0 inset-x-0 bg-white rounded-t-[32px] p-8 z-[300] md:hidden animate-in slide-in-from-bottom duration-300 shadow-2xl">
                        <div className="w-12 h-1.5 bg-navy/5 rounded-full mx-auto mb-8" />
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-navy/40">Writing Prompts</h3>
                            <button onClick={() => setIsPromptsOpen(false)} className="p-2 bg-navy/5 rounded-full text-navy/40">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar pb-10">
                            {prompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => {
                                        if (editor) {
                                            editor.chain().focus().insertContent((editor.isEmpty ? '' : '\n\n') + prompt).run();
                                            setIsPromptsOpen(false);
                                        }
                                    }}
                                    className="p-4 bg-navy/5 hover:bg-navy/10 rounded-2xl text-[13px] font-bold text-navy/70 text-left transition-all active:scale-95 flex items-center justify-between group"
                                >
                                    {prompt}
                                    <Plus size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Mobile Floating Action Button */}
            {!isPromptsOpen && activeTab === 'editor' && (
                <button
                    onClick={() => handleAction('published')}
                    disabled={isSaving}
                    className={`fixed bottom-20 right-6 z-[240] md:hidden w-14 h-14 bg-gradient-to-br from-primary to-accent text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${showHeader ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}
                >
                    <Check size={28} strokeWidth={3} />
                </button>
            )}
        </div>
    );
}

function DetailRow({ label, value, icon, isAction }: { label: string, value: string, icon?: React.ReactNode, isAction?: boolean }) {
    return (
        <div className="flex items-center justify-between p-3.5 text-[11px]">
            <span className="font-bold text-navy/30 uppercase tracking-widest text-[9px]">{label}</span>
            <div className="flex items-center gap-2 font-bold text-navy/70">
                {icon && <span className="text-navy/30">{icon}</span>}
                {value}
                {isAction && <ChevronLeft size={12} className="-rotate-90 text-navy/20" />}
            </div>
        </div>
    );
}

function ToolbarButton({ icon: Icon, onClick, isActive }: { icon: any, onClick: () => void, isActive?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-2xl transition-all duration-500 relative group shrink-0 ${isActive
                ? 'bg-navy text-white shadow-2xl shadow-navy/30  scale-105'
                : 'text-navy/30 hover:text-navy hover:bg-navy/5'
                }`}
        >
            <Icon size={20} strokeWidth={isActive ? 3 : 2} className="transition-transform group-active:scale-90" />
            {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            )}
        </button>
    );
}
