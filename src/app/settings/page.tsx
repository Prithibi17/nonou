"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/core/shell/AppShell";
import {
  Settings,
  Building2,
  GitBranch,
  ShieldCheck,
  Sliders,
  Zap,
  History,
  Plus,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "branches" | "roles" | "custom_fields" | "automations" | "audit">("general");
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Custom Field Form
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [fieldModel, setFieldModel] = useState("lead");
  const [fieldName, setFieldName] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");

  // Branch Form
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchAddress, setBranchAddress] = useState("");

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettingsData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCreateCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom_field",
          modelName: fieldModel,
          name: fieldName,
          label: fieldLabel,
          fieldType,
        }),
      });
      setFieldModalOpen(false);
      setFieldName("");
      setFieldLabel("");
      fetchSettings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "branch",
          name: branchName,
          code: branchCode,
          address: branchAddress,
        }),
      });
      setBranchModalOpen(false);
      setBranchName("");
      setBranchCode("");
      fetchSettings();
    } catch (e) {
      console.error(e);
    }
  };

  const org = settingsData?.organization || {
    name: "TechCorp India Solutions Pvt Ltd",
    gstin: "29AAAAA0000A1Z5",
    currency: "INR (₹)",
    country: "India",
    timezone: "Asia/Kolkata",
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Platform Settings & Studio</h1>
            <p className="text-xs text-muted-foreground">
              Multi-branch setup, RBAC permissions, custom field studio & audit trails
            </p>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-border gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: "general", label: "Organization", icon: Building2 },
            { id: "branches", label: "Branches", icon: GitBranch },
            { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
            { id: "custom_fields", label: "Custom Fields Studio", icon: Sliders },
            { id: "automations", label: "Automations", icon: Zap },
            { id: "audit", label: "System Audit Logs", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all shrink-0 ${
                  isActive
                    ? "border-brand-600 text-brand-600 font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Organization General */}
        {activeTab === "general" && (
          <div className="max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs animate-in fade-in">
            <h3 className="font-bold text-sm text-foreground">Organization Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Company Name</label>
                <input
                  type="text"
                  defaultValue={org.name}
                  className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-foreground font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">GSTIN Number</label>
                <input
                  type="text"
                  defaultValue={org.gstin || "29AAAAA0000A1Z5"}
                  className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 font-mono text-foreground"
                />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Country</label>
                <input
                  type="text"
                  defaultValue={org.country}
                  className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Base Currency</label>
                <input
                  type="text"
                  defaultValue="INR (₹) - Indian Rupee"
                  disabled
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-muted-foreground"
                />
              </div>
            </div>

            {/* Clean Real Data Mode */}
            <div className="mt-6 border-t border-border pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-foreground">Clean Real Workspace / Purge Demo Data</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Remove sample transactions (deals, quotes, invoices, tasks) to start fresh with 100% real business data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("Purge all demo transactions and switch to clean real data mode?")) {
                      await fetch("/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "purge_demo_data" }),
                      });
                      alert("Demo data purged! Your workspace is now 100% clean and ready for real records.");
                      window.location.reload();
                    }
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors shadow-2xs"
                >
                  Purge Demo Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Branches */}
        {activeTab === "branches" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Configured Branches</h3>
                <p className="text-xs text-muted-foreground">Multi-branch locations with separate or consolidated views</p>
              </div>
              <button
                onClick={() => setBranchModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Branch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(settingsData?.branches || []).map((b: any) => (
                <div key={b.id} className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{b.name}</span>
                    {b.isMain && (
                      <span className="rounded bg-brand-50 border border-brand-200 px-1.5 py-0.2 text-[9px] font-bold text-brand-700">
                        Main HQ
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">Code: {b.code}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{b.address || "No address specified"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Roles & Permissions Matrix */}
        {activeTab === "roles" && (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs animate-in fade-in">
            <div>
              <h3 className="font-bold text-sm text-foreground">Role Permissions Matrix</h3>
              <p className="text-xs text-muted-foreground">Object-level access rights across modules</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Role</th>
                    <th className="px-4 py-2.5">CRM</th>
                    <th className="px-4 py-2.5">Sales</th>
                    <th className="px-4 py-2.5">Invoicing</th>
                    <th className="px-4 py-2.5">Products</th>
                    <th className="px-4 py-2.5">Projects</th>
                    <th className="px-4 py-2.5">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(settingsData?.roles || []).map((r: any) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-bold text-foreground">
                        {r.name}
                        <p className="text-[10px] font-normal text-muted-foreground">{r.description}</p>
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">✓ Full</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">✓ Full</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">✓ Full</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">✓ Full</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">✓ Full</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">
                        {r.name === "Administrator" ? "✓ Admin" : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Custom Fields Studio */}
        {activeTab === "custom_fields" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Custom Field Studio</h3>
                <p className="text-xs text-muted-foreground">Dynamically extend models with custom fields without code</p>
              </div>
              <button
                onClick={() => setFieldModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Custom Field</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(settingsData?.customFields || []).map((f: any) => (
                <div key={f.id} className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{f.label}</span>
                    <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 text-[9px] font-bold text-indigo-700 uppercase">
                      {f.fieldType}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">Key: {f.name}</p>
                  <p className="text-xs text-muted-foreground">Target Model: <strong className="text-foreground capitalize">{f.modelName}</strong></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Automations */}
        {activeTab === "automations" && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="font-bold text-sm text-foreground">Automation Rules</h3>
              <p className="text-xs text-muted-foreground">Triggers, conditions, and action dispatchers</p>
            </div>

            <div className="space-y-2.5">
              {(settingsData?.automations || []).map((rule: any) => (
                <div key={rule.id} className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-600">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{rule.name}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Trigger: <strong className="text-foreground">{rule.triggerType}</strong> on model <strong className="text-foreground">{rule.modelName}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                    Active Rule
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: System Audit Logs */}
        {activeTab === "audit" && (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs animate-in fade-in">
            <div>
              <h3 className="font-bold text-sm text-foreground">System Audit Trail</h3>
              <p className="text-xs text-muted-foreground">Immutable history of critical mutations across all records</p>
            </div>

            <div className="space-y-2">
              {(settingsData?.auditLogs || []).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <History className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-bold text-foreground">{log.user?.firstName || "System"}</span>{" "}
                      <span className="text-muted-foreground">{log.action.replace("_", " ")} on</span>{" "}
                      <strong className="text-brand-600 capitalize">{log.recordType}</strong>
                      {log.newValue && (
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {log.oldValue ? `${log.oldValue} → ` : ""}{log.newValue}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(log.createdAt, "dd MMM yyyy, HH:mm")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Field Modal */}
        {fieldModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
                <h3 className="font-bold text-sm text-foreground">Add Custom Field</h3>
                <button onClick={() => setFieldModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleCreateCustomField} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Target Model</label>
                  <select
                    value={fieldModel}
                    onChange={(e) => setFieldModel(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  >
                    <option value="lead">CRM Leads / Opportunities</option>
                    <option value="contact">Contacts / Customers</option>
                    <option value="product">Products Catalog</option>
                    <option value="task">Project Tasks</option>
                    <option value="quotation">Quotations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Field Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Target Launch Quarter"
                    value={fieldLabel}
                    onChange={(e) => {
                      setFieldLabel(e.target.value);
                      setFieldName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "_"));
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Field Type</label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="currency">Currency (₹)</option>
                    <option value="date">Date</option>
                    <option value="select">Dropdown Selection</option>
                    <option value="boolean">Checkbox (Yes/No)</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setFieldModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
                  >
                    Create Field
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Branch Modal */}
        {branchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
                <h3 className="font-bold text-sm text-foreground">Add New Branch</h3>
                <button onClick={() => setBranchModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleCreateBranch} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Branch Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad Tech Hub (HITEC City)"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="HYD-HITEC"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Physical Address</label>
                  <textarea
                    rows={2}
                    placeholder="HITEC City, Madhapur, Hyderabad, Telangana"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600 resize-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setBranchModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
                  >
                    Create Branch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
