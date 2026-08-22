"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Users,
  Target,
  FileText,
  Receipt,
  Package,
  FolderKanban,
  Check,
  Briefcase,
  Utensils,
  Laptop,
  Factory,
  ShoppingBag,
  Wrench,
  GraduationCap,
  Truck,
  ShieldCheck,
  Mail,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

const INDUSTRIES = [
  {
    id: "software",
    name: "Software & SaaS",
    icon: Laptop,
    description: "CRM, Deal Pipelines, Invoicing, Projects, Timesheets",
    recommendedApps: ["crm", "sales", "invoices", "projects", "contacts"],
  },
  {
    id: "services",
    name: "Professional Services & Agency",
    icon: Briefcase,
    description: "Client Management, Quotations, Invoicing, Projects",
    recommendedApps: ["contacts", "sales", "invoices", "projects", "crm"],
  },
  {
    id: "retail",
    name: "Retail & E-commerce",
    icon: ShoppingBag,
    description: "Product Master, Variants, Invoicing, Inventory, POS",
    recommendedApps: ["products", "invoices", "contacts", "sales"],
  },
  {
    id: "restaurant",
    name: "Restaurant & Food Services",
    icon: Utensils,
    description: "POS, Inventory, Vendor Invoicing, Staff Tracking",
    recommendedApps: ["products", "invoices", "contacts"],
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Production",
    icon: Factory,
    description: "Production Orders, Quality, Products, Invoices",
    recommendedApps: ["products", "sales", "invoices", "projects"],
  },
  {
    id: "logistics",
    name: "Logistics & Supply Chain",
    icon: Truck,
    description: "Fleet tracking, Invoicing, Vendor Accounts",
    recommendedApps: ["contacts", "invoices", "projects"],
  },
];

const ALL_APPS = [
  { id: "crm", name: "CRM & Pipelines", icon: Target, category: "Sales", desc: "Leads, pipeline stages, revenue forecasting" },
  { id: "sales", name: "Sales & Quotations", icon: FileText, category: "Sales", desc: "Quotations, approval workflows, PDF orders" },
  { id: "invoices", name: "Invoicing & GST", icon: Receipt, category: "Finance", desc: "GST calculations, payment reconciliation, aging" },
  { id: "products", name: "Product Master", icon: Package, category: "Catalog", desc: "SKU tracking, variants, pricing, stock levels" },
  { id: "projects", name: "Projects & Tasks", icon: FolderKanban, category: "Operations", desc: "Kanban task boards, milestones, timesheets" },
  { id: "contacts", name: "Contacts Directory", icon: Users, category: "Core", desc: "360° customer, vendor and partner history" },
  { id: "automations", name: "Automation Engine", icon: Zap, category: "Platform", desc: "When X happens, If Y matches, Then perform Z" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: User Account
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    // Step 2: Org Info
    orgName: "",
    country: "India",
    state: "Karnataka",
    currency: "INR",
    currencySymbol: "₹",
    gstin: "",
    timezone: "Asia/Kolkata",
    companySize: "10-50",
    // Step 3: Industry
    industry: "software",
    // Step 4: Selected Apps
    selectedApps: ["crm", "sales", "invoices", "products", "projects", "contacts", "automations"],
    // Step 5: Invite Team
    teamEmails: "",
  });

  const [loading, setLoading] = useState(false);

  const handleIndustrySelect = (indId: string) => {
    const ind = INDUSTRIES.find((i) => i.id === indId);
    setFormData({
      ...formData,
      industry: indId,
      selectedApps: ind?.recommendedApps || formData.selectedApps,
    });
  };

  const toggleApp = (appId: string) => {
    const next = formData.selectedApps.includes(appId)
      ? formData.selectedApps.filter((a) => a !== appId)
      : [...formData.selectedApps, appId];
    setFormData({ ...formData, selectedApps: next });
  };

  const handleNextStep = async () => {
    // If on Step 1 and user entered account info, register user account
    if (currentStep === 1 && formData.email && formData.password) {
      setLoading(true);
      try {
        await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName || "Admin",
            lastName: formData.lastName || "User",
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            country: formData.country,
          }),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Create new real organization with wizard inputs
      await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.orgName || "My Organization",
          industry: formData.industry,
          country: formData.country,
          currency: formData.currency,
          gstin: formData.gstin,
          phone: formData.phone,
          selectedApps: formData.selectedApps,
        }),
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-lg shadow-brand-500/30">
            <Layers className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">BusinessOS</span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>Step {currentStep} of 5</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  step === currentStep
                    ? "w-6 bg-brand-500"
                    : step < currentStep
                    ? "w-3 bg-emerald-500"
                    : "w-3 bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-2xl mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in fade-in">
        {/* STEP 1: Account Creation */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400 border border-brand-500/20 mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Quick Setup</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Create your Administrator Account</h2>
              <p className="text-xs text-slate-400 mt-1">
                You will be the primary Super Administrator of this BusinessOS environment.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-brand-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Phone (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-brand-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-800/50 p-3 border border-slate-700/50 text-[11px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Supports Email/Password, Passkeys, Google OAuth, and Enterprise SAML SSO.</span>
            </div>
          </div>
        )}

        {/* STEP 2: Company Setup */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white">Organization & Localization</h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure your company details, fiscal currency, and tax identifiers.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company / Organization Name *</label>
              <input
                type="text"
                required
                value={formData.orgName}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white focus:outline-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Country</label>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Currency</label>
                <input
                  type="text"
                  disabled
                  value={formData.country === "India" ? "INR (₹) - Indian Rupee" : "USD ($) - US Dollar"}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/40 px-3.5 py-2.5 text-xs text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">GSTIN / Tax ID</label>
                <input
                  type="text"
                  placeholder="29AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white focus:outline-brand-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Size</label>
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white focus:outline-brand-500"
                >
                  <option value="1-10">1 - 10 Employees</option>
                  <option value="10-50">10 - 50 Employees</option>
                  <option value="50-200">50 - 200 Employees</option>
                  <option value="200+">200+ Enterprise</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Industry Selection */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white">What kind of business do you operate?</h2>
              <p className="text-xs text-slate-400 mt-1">
                BusinessOS automatically recommends the right initial application bundle.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {INDUSTRIES.map((ind) => {
                const Icon = ind.icon;
                const isSelected = formData.industry === ind.id;
                return (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => handleIndustrySelect(ind.id)}
                    className={`flex flex-col text-left rounded-2xl p-4 border transition-all ${
                      isSelected
                        ? "bg-brand-500/10 border-brand-500 ring-1 ring-brand-500 shadow-lg shadow-brand-500/10"
                        : "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? "bg-brand-600 text-white" : "bg-slate-700 text-slate-300"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-400" />}
                    </div>
                    <span className="font-bold text-xs text-white">{ind.name}</span>
                    <span className="text-[10px] text-slate-400 mt-1 leading-snug">{ind.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: App Selection */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white">Select Applications to Install</h2>
              <p className="text-xs text-slate-400 mt-1">
                You can always install or uninstall additional apps from the App Marketplace later.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {ALL_APPS.map((app) => {
                const Icon = app.icon;
                const isInstalled = formData.selectedApps.includes(app.id);
                return (
                  <div
                    key={app.id}
                    onClick={() => toggleApp(app.id)}
                    className={`flex items-start justify-between rounded-2xl p-3.5 border cursor-pointer transition-all ${
                      isInstalled
                        ? "bg-brand-500/10 border-brand-500/70 shadow-sm"
                        : "bg-slate-800/40 border-slate-700/50 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isInstalled ? "bg-brand-600 text-white" : "bg-slate-700 text-slate-300"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-white">{app.name}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{app.desc}</span>
                      </div>
                    </div>
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isInstalled ? "bg-brand-500 border-brand-400 text-white" : "border-slate-600"}`}>
                      {isInstalled && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Invite Team & Launch */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Ready to Launch</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Invite your team to collaborate</h2>
              <p className="text-xs text-slate-400 mt-1">
                Collaborate with role-based visibility across Leads, Quotations, and Projects.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Colleagues Email Addresses (comma separated)</label>
              <textarea
                rows={3}
                value={formData.teamEmails}
                onChange={(e) => setFormData({ ...formData, teamEmails: e.target.value })}
                placeholder="colleague1@company.com, colleague2@company.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white focus:outline-brand-500 resize-none"
              />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/30 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-300">Your BusinessOS Summary:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div>Organization: <strong className="text-white">{formData.orgName}</strong></div>
                <div>Country: <strong className="text-white">{formData.country} ({formData.currency})</strong></div>
                <div>Industry: <strong className="text-white capitalize">{formData.industry}</strong></div>
                <div>Apps: <strong className="text-brand-400">{formData.selectedApps.length} Modules</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-6 mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              <span>{loading ? "Processing..." : "Continue"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:from-brand-500 hover:to-indigo-500 transition-all shadow-xl shadow-brand-500/25 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? "Launching Workspace..." : "Launch BusinessOS Workspace"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 py-2">
        BusinessOS Enterprise Platform • Modular Kernel Architecture
      </div>
    </div>
  );
}
