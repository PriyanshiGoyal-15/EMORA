"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userService } from '@/lib/firestore-service';
import { Camera, Mail, User, Briefcase, MapPin, Loader2, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';

export default function ProfileSettings() {
  const { user, setUserImage } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    jobTitle: '',
    location: '',
    image: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        const data = await userService.getSettings(user.uid);
        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email || user.email || '',
            bio: data.bio || '',
            jobTitle: data.jobTitle || '',
            location: data.location || '',
            image: data.image || ''
          });
        } else {
          setFormData(prev => ({ ...prev, email: user.email || '' }));
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setFetching(false);
      }
    };

    if (user) fetchSettings();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File is too large (max 10MB)' });
        return;
      }

      setMessage({ type: 'info', text: 'Processing image...' });

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 150; // Ultra compact
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
          }

          // Quality 0.4 for maximum safety
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.4);

          setFormData(prev => ({ ...prev, image: compressedDataUrl }));
          setMessage({ type: '', text: '' });

          console.log('Compressed image length:', compressedDataUrl.length);
          if (compressedDataUrl.length > 500000) {
            setMessage({ type: 'error', text: 'Selected image is still too complex. Please try a different one.' });
          }
        };
        img.onerror = () => {
          setMessage({ type: 'error', text: 'Failed to process image format.' });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Check total payload size roughly
    const payloadSize = JSON.stringify(formData).length;
    if (payloadSize > 1000000) {
      setMessage({ type: 'error', text: 'Profile data is too large. Try removing the photo or shortening your bio.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await userService.updateSettings(user.uid, formData);
      setUserImage(formData.image || null); // ← instant Topbar update
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('longer than 1048487 bytes')) {
        setMessage({ type: 'error', text: 'Database limit exceeded. Please remove the photo and save again.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await userService.deleteAccountData(user.uid);
      await user.delete();
      await signOut(auth);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete account');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const userInitial = formData.name ? formData.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : '?';

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-navy">Profile Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your public information and how others see you.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-[#f8faff] border border-gray-100">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <div onClick={() => fileInputRef.current?.click()} className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden group-hover:opacity-90 transition-opacity border-4 border-white">
            {formData.image ? <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" /> : userInitial}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white">
            <Camera className="w-8 h-8" />
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="font-bold text-navy text-lg">Your Profile Picture</h3>
          <p className="text-sm text-gray-500 mt-1">Click the avatar or the button below to upload a new one.</p>
          <div className="mt-3 flex gap-2 justify-center sm:justify-start">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-navy hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Camera className="w-3 h-3" /> Change
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="px-4 py-1.5 text-red-500 text-xs font-bold hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" placeholder="John Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" disabled value={formData.email} className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-400 cursor-not-allowed text-sm font-medium" placeholder="john@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Job Title</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" placeholder="Software Engineer" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" placeholder=" Rajasthan,India" />
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Bio</label>
            <textarea rows={4} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium resize-none" placeholder="Tell us a little bit about yourself..." />
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-success/10 text-success' : message.type === 'info' ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="pt-8 mt-8 border-t border-gray-100">
        <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Danger Zone
        </h3>
        <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all of your data. This action cannot be undone.</p>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-4 w-full sm:w-auto px-6 py-2.5 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all text-sm"
        >
          Delete My Account
        </button>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </div>
  );
}
