'use client'

import React from 'react';
import { Plus, Search } from 'lucide-react';

interface JournalHeaderProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onNewEntry: () => void;
}

export default function JournalHeader({
    activeFilter,
    onFilterChange,
    searchQuery,
    onSearchChange,
    onNewEntry
}: JournalHeaderProps) {
    const filters = ['All', 'Low', 'Sad', 'Okay', 'Good', 'Great'];

    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-10 px-2">
            {/* Left Side: New Entry + Divider + Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                <button
                    onClick={onNewEntry}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm shrink-0 whitespace-nowrap"
                >
                    <Plus size={18} strokeWidth={3} />
                    New Entry
                </button>

                <div className="h-8 w-px bg-gray-200 shrink-0 hidden sm:block" />

                <div className="w-full sm:w-auto flex items-center gap-1.5 bg-white/50 p-1.5 rounded-2xl border border-gray-100 backdrop-blur-sm shadow-xs overflow-x-auto no-scrollbar scrollbar-hide flex-nowrap">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => onFilterChange(filter)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${activeFilter === filter
                                ? 'bg-navy text-white shadow-md'
                                : 'text-navy/50 hover:text-navy hover:bg-white/80'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Side: Search */}
            <div className="relative group w-full lg:w-72">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30 group-focus-within:text-primary transition-colors">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search reflections..."
                    className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-sm"
                />
            </div>
        </div>
    );
}
