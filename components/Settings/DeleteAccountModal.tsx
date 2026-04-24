"use client";

import React, { useState } from 'react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}: DeleteAccountModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={isDeleting ? undefined : onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-[28px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-red-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all disabled:opacity-0"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-5 sm:mb-6 animate-pulse">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-navy mb-2 sm:mb-3">Wait! Are you sure?</h3>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6 sm:mb-8">
            You are about to permanently delete your Emora account. This action is
            <span className="text-red-600 font-bold"> irreversible </span>
            and will immediately erase:
          </p>

          <ul className="space-y-3 mb-8">
            {['Your personal profile & settings', 'All journal entries & memories', 'Your mood history & insights', 'AI conversation history'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {item}
              </li>
            ))}
          </ul>

          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mb-6 sm:mb-8">
            <label className="flex gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center shrink-0">
                <input
                  type="checkbox"
                  className="peer appearance-none w-5 h-5 border-2 border-red-200 rounded-md checked:bg-red-500 checked:border-red-500 transition-all cursor-pointer"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={isDeleting}
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-bold text-red-800 leading-tight group-hover:text-red-900 transition-colors">
                I understand that my data will be gone forever and cannot be recovered.
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={!confirmed || isDeleting}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-red-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Permanently Delete My Account
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-full py-4 bg-white hover:bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
