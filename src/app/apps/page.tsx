"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/core/shell/AppShell";
import {
  Grid,
  Check,
  Plus,
  Target,
  FileText,
  Receipt,
  Package,
  FolderKanban,
  Users,
  Zap,
  Boxes,
  LifeBuoy,
  Briefcase,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

interface AppDef {
  key: string;
  name: string;
  category: "Sales" | "Finance" | "Operations" | "Platform" | "Services";
  description: string;
  icon: any;
  color: string;
  version: string;
  isInstalled: boolean;
}

const MARKETPLACE_APPS: AppDef[] = [
  {
    key: "crm",
    name: "CRM & Pipelines",
    category: "Sales",
    description: "Manage deal pipelines, lead capture, sales stages, and revenue probabilities.",
    icon: Target,
    color: "bg-indigo-500 text-white",
    version: "v1.2.0",
    isInstalled: true,
  },
  {
    key: "sales",
    name: "Sales & Quotations",
    category: "Sales",
    description: "Multi-line quotation builder, PDF generation, discount approvals & order confirmation.",
    icon: FileText,
    color: "bg-blue-500 text-white",
    version: "v1.1.0",
    isInstalled: true,
  },
  {
    key: "invoices",
    name: "Invoicing & GST",
    category: "Finance",
    description: "Full double-entry tax invoicing, automatic CGST/SGST/IGST splitting & payment receipts.",
    icon: Receipt,
    color: "bg-emerald-500 text-white",
    version: "v1.3.0",
    isInstalled: true,
  },
  {
    key: "products",
    name: "Product Catalog",
    category: "Operations",
    description: "SKU tracking, variant attributes, price lists, and low-stock reorder thresholds.",
    icon: Package,
    color: "bg-amber-500 text-white",
    version: "v1.0.4",
    isInstalled: true,
  },
  {
    key: "projects",
    name: "Projects & Tasks",
    category: "Operations",
    description: "Kanban task execution, milestone tracking, timesheets, and assignee management.",
    icon: FolderKanban,
    color: "bg-purple-500 text-white",
    version: "v1.2.1",
    isInstalled: true,
  },
  {
    key: "contacts",
    name: "Contacts 360°",
    category: "Sales",
    description: "Unified relationship directory for customers, vendors, and partners.",
    icon: Users,
    color: "bg-rose-500 text-white",
    version: "v1.0.0",
    isInstalled: true,
  },
  {
    key: "automations",
    name: "Automation Engine",
    category: "Platform",
    description: "Event-driven rule engine (WHEN trigger IF condition THEN execute actions).",
    icon: Zap,
    color: "bg-yellow-500 text-white",
    version: "v1.4.0",
    isInstalled: true,
  },
  {
    key: "inventory",
    name: "Warehouse & Inventory",
    category: "Operations",
    description: "Multi-warehouse locations, batch/lot tracking, transfers, and barcode scanning.",
    icon: Boxes,
    color: "bg-teal-500 text-white",
    version: "v2.0 Beta",
    isInstalled: false,
  },
  {
    key: "helpdesk",
    name: "Helpdesk & SLA Support",
    category: "Services",
    description: "Ticket routing, customer support inbox, SLA timers, and agent assignment.",
    icon: LifeBuoy,
    color: "bg-cyan-500 text-white",
    version: "v2.0 Beta",
    isInstalled: false,
  },
  {
    key: "hr",
    name: "HR & Employee Profiles",
    category: "Services",
    description: "Employee records, department hierarchy, attendance, and leave management.",
    icon: Briefcase,
    color: "bg-slate-700 text-white",
    version: "v2.0 Beta",
    isInstalled: false,
  },
  {
    key: "ecommerce",
    name: "eCommerce Storefront",
    category: "Sales",
    description: "Online catalog sync, customer cart checkout, and digital payment webhooks.",
    icon: ShoppingCart,
    color: "bg-pink-500 text-white",
    version: "v2.0 Beta",
    isInstalled: false,
  },
];

export default function AppsPage() {
  const [apps, setApps] = useState<AppDef[]>(MARKETPLACE_APPS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Sales", "Finance", "Operations", "Platform", "Services"];

  const handleToggle = (key: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.key === key) {
          const nextState = !app.isInstalled;
          if (nextState) {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
          }
          return { ...app, isInstalled: nextState };
        }
        return app;
      })
    );
  };

  const filteredApps =
    selectedCategory === "All"
      ? apps
      : apps.filter((a) => a.category === selectedCategory);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md">
              <Grid className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">App Marketplace & Modular Kernel</h1>
              <p className="text-xs text-muted-foreground">
                Install and configure business modules on your BusinessOS kernel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 shadow-2xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-brand-50 text-brand-700 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.key}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-brand-200 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${app.color} shadow-sm`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{app.name}</h3>
                        <span className="text-[10px] font-mono text-muted-foreground">{app.version}</span>
                      </div>
                    </div>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {app.category}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {app.isInstalled ? "Active in workspace" : "Available to install"}
                  </span>
                  <button
                    onClick={() => handleToggle(app.key)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs ${
                      app.isInstalled
                        ? "border border-border bg-muted text-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        : "bg-brand-600 text-white hover:bg-brand-700 active:scale-95"
                    }`}
                  >
                    {app.isInstalled ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Installed</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Install App</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
