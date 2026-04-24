import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
}

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Conversation?",
    description = "This action is permanent and will remove all messages from this chat.",
    confirmText = "Delete",
    cancelText = "Cancel"
}: DeleteModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 z-100 flex items-center justify-center p-4 lg:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-navy/40 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 scale-animation">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>

                    <h3 className="text-xl font-bold text-navy mb-3">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-[240px] mx-auto">
                        {description}
                    </p>
                </div>

                <div className="flex p-4 gap-3 bg-gray-50/50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-white hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-sm transition-all border border-gray-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-500/20"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .scale-animation {
                    animation: pulse-red 2s infinite;
                }
                @keyframes pulse-red {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>,
        document.body
    );
}
