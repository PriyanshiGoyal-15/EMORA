'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Heart,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      // Automatically sign in after registration
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        callbackUrl: '/',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "Free forever — no credit card needed",
      icon: <CheckCircle2 className="w-5 h-5 text-success" />
    },
    {
      title: "Your data is private & encrypted",
      icon: <ShieldCheck className="w-5 h-5 text-accent" />
    },
    {
      title: "Non-judgmental, always available",
      icon: <MessageCircle className="w-5 h-5 text-primary" />
    },
    {
      title: "Built with empathy, not algorithms",
      icon: <Heart className="w-5 h-5 text-red-400" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-background">
      {/* Left Pane - Sidebar (Visible only on Desktop) */}
      <div className="hidden md:flex w-full md:w-2/5 lg:w-1/3 bg-navy p-12 flex flex-col justify-between text-white overflow-hidden relative">
        <div className="z-10">
          <div className="logo-text text-4xl mb-12 flex items-center gap-2">
            Emora
          </div>

          <h2 className="text-3xl font-medium leading-tight mb-12">
            Start your journey toward emotional clarity and self-awareness today.
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
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px]" />
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
            <h1 className="text-3xl font-bold text-navy mb-2">Create your account</h1>
            <p className="text-gray-500">Join thousands already on their wellness journey</p>
          </div>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full bg-white border border-card-border py-4 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all mb-8 font-bold text-navy shadow-sm active:scale-[0.98]"
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
            Sign up with Google
          </button>

          <div className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-card-border" />
            </div>
            <span className="relative px-4 bg-background text-sm text-gray-400">or with email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first Name"
                  className="w-full bg-white border border-card-border rounded-xl px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last Name"
                  className="w-full bg-white border border-card-border rounded-xl px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full bg-white border border-card-border rounded-xl px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Set your password"
                  className="w-full bg-white border border-card-border rounded-xl px-4 py-3 pr-12 text-navy focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-white font-bold py-4 rounded-xl hover:bg-navy/90 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-navy/20 mt-4 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create account — it&apos;s free
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
