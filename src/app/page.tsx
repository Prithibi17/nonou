import React from "react";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  Sparkles,
  Target,
  FileText,
  Receipt,
  Package,
  FolderKanban,
  Users,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-lg shadow-brand-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">BusinessOS</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 transition-all shadow-md shadow-brand-500/25"
            >
              <span>Create Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto text-center px-6 pt-20 pb-16 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-300 backdrop-blur-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Enterprise Modular Business Operating System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          The Operating System for <br />
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Modern Business Operations
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
          Unify your CRM pipelines, sales quotations, GST invoicing, product catalog, project execution,
          and workflows on one high-performance, real-time data kernel.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-brand-500 transition-all shadow-xl shadow-brand-500/25 hover:scale-105 active:scale-95"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-all"
          >
            <Lock className="h-4 w-4 text-slate-400" />
            <span>Sign In to Workspace</span>
          </Link>
        </div>
      </section>

      {/* Core Kernel Engines Showcase */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Platform Engines Kernel</h2>
          <p className="text-xs text-slate-400 mt-1">Built from foundational engines rather than isolated silos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Universal View Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamlessly switch any business model between List (DataTable), Kanban (Drag & Drop), Calendar, and Activity Matrix representations.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Visual Compound Filter Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Construct complex AND / OR structured queries across any field type with date presets, saved searches, and dynamic grouping.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Multi-Branch & RBAC Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise multi-tenancy hierarchy with organization boundaries, branch isolation, and granular role permissions.
            </p>
          </div>
        </div>
      </section>

      {/* Modular Apps Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-800/60">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Integrated Business Applications</h2>
          <p className="text-xs text-slate-400 mt-1">Plug-and-play applications sharing the universal record foundation</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: "CRM & Pipelines", icon: Target, color: "text-indigo-400" },
            { name: "Sales & Quotes", icon: FileText, color: "text-blue-400" },
            { name: "Invoicing & GST", icon: Receipt, color: "text-emerald-400" },
            { name: "Product Master", icon: Package, color: "text-amber-400" },
            { name: "Projects & Tasks", icon: FolderKanban, color: "text-purple-400" },
            { name: "Contacts 360°", icon: Users, color: "text-rose-400" },
          ].map((app, idx) => {
            const Icon = app.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-center hover:border-slate-700 transition-colors"
              >
                <Icon className={`h-6 w-6 ${app.color} mb-2`} />
                <span className="font-bold text-xs text-white">{app.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>BusinessOS Platform • Enterprise Modular Kernel Architecture</p>
      </footer>
    </div>
  );
}
