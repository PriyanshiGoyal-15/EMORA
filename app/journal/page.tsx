'use client'

import React, { useState, useEffect } from 'react';
import JournalHeader from '@/components/Journal/JournalHeader';
import JournalCard from '@/components/Journal/JournalCard';
import NewEntryJournal from '@/components/Journal/NewEntryJournal';
import { Loader2, Plus } from 'lucide-react';

export default function JournalPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<any>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/journal');
            if (!response.ok) throw new Error('Failed to fetch entries');
            const data = await response.json();
            setEntries(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEditor = (entry: any = null, readOnly = false) => {
        setSelectedEntry(entry);
        setIsReadOnly(readOnly);
        setIsEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setSelectedEntry(null);
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/journal/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setEntries(prev => prev.filter(entry => entry._id !== id));
            } else {
                throw new Error('Failed to delete entry');
            }
        } catch (err: any) {
            alert('Error deleting entry: ' + err.message);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();

        const isToday = date.toDateString() === now.toDateString();

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return `Today, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        if (isYesterday) return `Yesterday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSearch =
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = activeFilter === 'All' || entry.mood === activeFilter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen pb-20 space-y-8 animate-in fade-in duration-700 ">
            {/* Header Section */}
            <JournalHeader
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNewEntry={() => handleOpenEditor()}
            />

            {/* Content Section */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-4 opacity-50">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm font-bold text-navy uppercase tracking-widest">Loading reflections...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-500 font-bold">
                    Error: {error}
                </div>
            ) : entries.length > 0 ? (
                <>
                    {filteredEntries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-4 pb-10">
                            {filteredEntries.map((entry) => (
                                <div key={entry._id} className="h-full">
                                    <JournalCard
                                        id={entry._id}
                                        date={formatDate(entry.timestamp)}
                                        title={entry.title}
                                        content={entry.content}
                                        mood={entry.mood}
                                        emoji={getEmoji(entry.mood)}
                                        tags={entry.tags}
                                        status={entry.status}
                                        onDelete={handleDelete}
                                        onEdit={() => handleOpenEditor(entry, false)}
                                        onClick={() => handleOpenEditor(entry, true)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-navy/5 rounded-full flex items-center justify-center text-4xl grayscale">
                                🔍
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-navy/60">No matching reflections</h3>
                                <p className="text-sm text-navy/30 font-medium">Try adjusting your mood filter or search query.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                                    className="mt-2 text-primary text-sm font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl shadow-navy/5 flex items-center justify-center text-5xl">
                        ✒️
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-navy">Your story starts here</h3>
                        <p className="text-sm text-navy/40 max-w-[280px] mx-auto font-medium">
                            Every word you write is a step toward clarity. Click "New Entry" to begin.
                        </p>
                        <button
                            onClick={() => handleOpenEditor()}
                            className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            + Write my first entry
                        </button>
                    </div>
                </div>
            )}

            {/* Editor Overlay */}
            <NewEntryJournal
                isOpen={isEditorOpen}
                onClose={handleCloseEditor}
                editEntry={selectedEntry}
            />
        </div>
    );
}

// Helper to get emoji based on mood if not stored directly
function getEmoji(mood: string) {
    const map: any = {
        Low: '😞',
        Sad: '😢',
        Okay: '😐',
        Good: '😊',
        Great: '😁',
        Anxious: '😰'
    };
    return map[mood] || '😐';
}