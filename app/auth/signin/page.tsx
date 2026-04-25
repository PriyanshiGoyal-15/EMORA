'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import {
  Sparkles,
  BarChart3,
  BookOpen,
  Leaf,
  LogIn,
  Loader2,
  Eye,
  ArrowRight,
  EyeOff,
  Mail,
  Lock,
  User
} from 'lucide-react';


export default function SigninPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/');
    } catch (err: any) {
      setError(err.code === 'auth/invalid-credential' ? 'Invalid email or password' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "AI-powered emotional support, 24/7",
      icon: <Sparkles className="w-5 h-5 text-primary" />
    },
    {
      title: "Mood tracking & personal insights",
      icon: <BarChart3 className="w-5 h-5 text-accent" />
    },
    {
      title: "Private, secure journaling space",
      icon: <BookOpen className="w-5 h-5 text-success" />
    },
    {
      title: "Mental wellness resources curated for you",
      icon: <Leaf className="w-5 h-5 text-orange-400" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-background">
      {/* Left Pane - Sidebar (Visible only on Desktop) */}
      <div className="hidden md:flex w-full md:w-2/5 lg:w-1/3 bg-navy p-12 flex-col justify-between text-white overflow-hidden relative">
        <div className="z-10">
          <div className="logo-text text-4xl mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            Emora
          </div>


          <h2 className="text-3xl font-medium leading-tight mb-12">
            Your safe space to express, reflect, and heal — powered by compassionate AI.
          </h2>

          <div className="space-y-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  {feature.icon}
                </div>
                <span className="text-lg text-gray-300 font-medium">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-12">
            <div className="logo-text text-4xl text-navy mb-2">Emora</div>
            <div className="w-8 h-1 bg-primary rounded-full" />
          </div>

          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-navy mb-2">Welcome back</h1>
            <p className="text-gray-500">Sign in to continue your wellness journey</p>
          </div>

          {/* <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-card-border py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all mb-6 font-bold text-navy shadow-sm active:scale-[0.98] ring-1 ring-gray-100"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm">Continue with Google</span>
          </button>

          <div className="relative mb-6 text-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-100" />
            </div>
            <span className="relative px-4 bg-background text-[10px] font-bold text-gray-400 uppercase tracking-widest">or sign in with email</span>
          </div> */}



          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane.doe@example.com"
                  className="w-full bg-white/80 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300 font-medium"
                />
              </div>
            </div>


            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                {/* <Link href="#" className="text-[10px] font-bold text-primary hover:underline tracking-tight uppercase">Forgot password?</Link> */}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-white/80 border border-gray-100 rounded-2xl pl-11 pr-12 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-white transition-all"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>


            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-white font-bold py-4 rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-navy/20 mt-6 disabled:opacity-50 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign in <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>

          </form>

          <p className="text-center text-gray-500 mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
