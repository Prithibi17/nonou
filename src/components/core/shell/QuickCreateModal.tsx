"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Target,
  FileText,
  Receipt,
  Package,
  CheckSquare,
  Users,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function QuickCreateModal() {
  const router = useRouter();
  const { quickCreateOpen, setQuickCreateOpen, quickCreateType } = useAppStore();
  const [selectedType, setSelectedType] = useState<string>(quickCreateType || "lead");

  // Form states
  const [leadForm, setLeadForm] = useState({ name: "", companyName: "", contactName: "", email: "", phone: "", expectedRevenue: 100000, priority: "Medium" });
  const [contactForm, setContactForm] = useState({ name: "", companyName: "", email: "", phone: "", isCustomer: true, city: "Bengaluru" });
  const [productForm, setProductForm] = useState({ name: "", sku: "", sellingPrice: 1000, costPrice: 500, stockOnHand: 10 });
  const [taskForm, setTaskForm] = useState({ title: "", priority: "Medium", estimatedHours: 8 });
  const [loading, setLoading] = useState(false);

  if (!quickCreateOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedType === "lead") {
        await fetch("/api/crm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadForm),
        });
        setQuickCreateOpen(false);
        router.push("/crm");
        router.refresh();
      } else if (selectedType === "contact") {
        await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactForm),
        });
        setQuickCreateOpen(false);
        router.push("/contacts");
        router.refresh();
      } else if (selectedType === "product") {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productForm),
        });
        setQuickCreateOpen(false);
        router.push("/products");
        router.refresh();
      } else if (selectedType === "task") {
        // Fetch first project
        const res = await fetch("/api/projects");
        const data = await res.json();
        const firstProj = data.projects?.[0];
        const firstStage = firstProj?.stages?.[0];

        if (firstProj && firstStage) {
          await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "task",
              projectId: firstProj.id,
              stageId: firstStage.id,
              ...taskForm,
            }),
          });
        }
        setQuickCreateOpen(false);
        router.push("/projects");
        router.refresh();
      } else if (selectedType === "sales") {
        setQuickCreateOpen(false);
        router.push("/sales?action=new");
      } else if (selectedType === "invoices") {
        setQuickCreateOpen(false);
        router.push("/invoices?action=new");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const TYPE_TABS = [
    { id: "lead", label: "Lead / Deal", icon: Target, color: "text-indigo-500" },
    { id: "contact", label: "Contact / Customer", icon: Users, color: "text-rose-500" },
    { id: "product", label: "Product Master", icon: Package, color: "text-amber-500" },
    { id: "task", label: "Task", icon: CheckSquare, color: "text-sky-500" },
    { id: "sales", label: "Quotation Builder", icon: FileText, color: "text-blue-500" },
    { id: "invoices", label: "Direct Invoice", icon: Receipt, color: "text-emerald-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-foreground">Universal Quick Create</span>
          </div>
          <button
            onClick={() => setQuickCreateOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-3 border-b border-border bg-background">
          {TYPE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`flex items-center gap-2 rounded-xl p-2 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-brand-50 border border-brand-200 text-brand-900 shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${tab.color}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {selectedType === "lead" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Deal / Lead Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Cloud ERP Migration"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={leadForm.companyName}
                    onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Expected Revenue (₹)</label>
                  <input
                    type="number"
                    value={leadForm.expectedRevenue}
                    onChange={(e) => setLeadForm({ ...leadForm, expectedRevenue: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="lead@company.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Priority</label>
                  <select
                    value={leadForm.priority}
                    onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {selectedType === "contact" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Reliance Retail"
                    value={contactForm.companyName}
                    onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="rahul@company.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>
              </div>
            </>
          )}

          {selectedType === "product" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Hosting Cluster"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.sellingPrice}
                    onChange={(e) => setProductForm({ ...productForm, sellingPrice: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={productForm.stockOnHand}
                    onChange={(e) => setProductForm({ ...productForm, stockOnHand: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>
              </div>
            </>
          )}

          {selectedType === "task" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Configure GSTIN Tax rules"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {(selectedType === "sales" || selectedType === "invoices") && (
            <div className="py-4 text-center text-xs text-muted-foreground">
              Click &ldquo;Launch Builder&rdquo; to open the full multi-line item builder.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setQuickCreateOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 shadow-sm"
            >
              {loading ? "Creating..." : selectedType === "sales" || selectedType === "invoices" ? "Launch Builder" : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
