"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Lock,
  Mail,
  User,
  Phone,
  Globe,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    country: "India",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Sign up on API
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Also register on Supabase Auth in background if needed
      try {
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              country: formData.country,
            },
          },
        });
      } catch {}

      // Advance directly to Onboarding to create their real organization
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      {/* Top Navbar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-lg shadow-brand-500/30">
            <Layers className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">BusinessOS</span>
        </Link>

        <Link
          href="/login"
          className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Sign In
        </Link>
      </div>

      {/* Signup Card */}
      <div className="max-w-lg mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in fade-in">
        <div className="text-center mb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400 border border-brand-500/20 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Create Real Account</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Get Started with BusinessOS</h2>
          <p className="text-xs text-slate-400">Set up your real administrator account and organization</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="Prithibi"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
              <input
                type="text"
                required
                placeholder="Mandi"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email *</label>
            <input
              type="email"
              required
              placeholder="user@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-brand-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white focus:outline-brand-500"
              >
                <option value="India">India (₹ INR)</option>
                <option value="United States">United States ($ USD)</option>
                <option value="United Kingdom">United Kingdom (£ GBP)</option>
                <option value="Singapore">Singapore ($ SGD)</option>
                <option value="UAE">United Arab Emirates (AED)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone (Optional)</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-xs font-bold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50 mt-3"
          >
            <span>{loading ? "Creating Account..." : "Create Account & Continue"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-brand-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 py-2">
        BusinessOS Enterprise Platform • Powered by Real Supabase Database Kernel
      </div>
    </div>
  );
}
