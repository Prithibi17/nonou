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
  Users,
  UserPlus,
  Lock,
  Eye,
  Edit3,
  Trash2,
  CheckSquare,
  Share2,
  Download,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "branches" | "users" | "roles" | "custom_fields" | "automations" | "audit"
  >("roles");
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Selected Role for Permission Matrix
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Invite User Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviteDepartment, setInviteDepartment] = useState("Sales");
  const [inviteTeam, setInviteTeam] = useState("Inside Sales");
  const [inviteBranchId, setInviteBranchId] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

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
      if (data.roles && data.roles.length > 0 && !selectedRoleId) {
        setSelectedRoleId(data.roles[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "invite_user",
          email: inviteEmail,
          firstName: inviteFirstName,
          lastName: inviteLastName,
          roleId: inviteRoleId,
          department: inviteDepartment,
          team: inviteTeam,
          defaultBranchId: inviteBranchId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to invite user");
      }

      setInviteModalOpen(false);
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      fetchSettings();
    } catch (err: any) {
      setInviteError(err.message);
    }
  };

  const handleUpdatePermission = async (
    roleId: string,
    module: string,
    field: string,
    value: any
  ) => {
    try {
      const currentRole = settingsData?.roles?.find((r: any) => r.id === roleId);
      const currentPerm = currentRole?.permissions?.find((p: any) => p.module === module) || {};

      const updatedPayload = {
        type: "update_permission_scope",
        roleId,
        module,
        ...currentPerm,
        [field]: value,
      };

      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });

      fetchSettings();
    } catch (e) {
      console.error(e);
    }
  };

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
    name: "BusinessOS Workspace",
    currency: "INR (₹)",
    country: "India",
  };

  const selectedRole = settingsData?.roles?.find((r: any) => r.id === selectedRoleId);

  const MODULES_LIST = [
    { key: "crm", label: "CRM & Pipelines" },
    { key: "sales", label: "Sales & Quotes" },
    { key: "invoices", label: "Invoicing & GST" },
    { key: "products", label: "Product Master" },
    { key: "projects", label: "Projects & Tasks" },
    { key: "contacts", label: "Contacts Directory" },
    { key: "inventory", label: "Inventory & Warehouses" },
    { key: "helpdesk", label: "Helpdesk & Tickets" },
    { key: "hr", label: "HR & Employees" },
    { key: "settings", label: "Platform Settings" },
    { key: "automation", label: "Automation Rules" },
    { key: "portal", label: "Customer/Vendor Portal" },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Platform Settings & Enterprise RBAC</h1>
              <p className="text-xs text-muted-foreground">
                5-Dimensional Role Scoping, User Permissions, Branches, and Studio
              </p>
            </div>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-border gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: "roles", label: "Roles & 5D Permissions", icon: ShieldCheck },
            { id: "users", label: "Team & Users", icon: Users },
            { id: "general", label: "Organization", icon: Building2 },
            { id: "branches", label: "Branches", icon: GitBranch },
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

        {/* Tab 1: Roles & 5D Permissions Matrix */}
        {activeTab === "roles" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in">
            {/* Left: Role Selector List */}
            <div className="lg:col-span-1 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Enterprise Roles ({settingsData?.roles?.length || 0})
                </h3>
              </div>

              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {(settingsData?.roles || []).map((r: any) => {
                  const isSelected = r.id === selectedRoleId;
                  const isOwner = r.name.includes("Administrator") || r.name.includes("Owner");
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoleId(r.id)}
                      className={`w-full flex flex-col text-left p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? "border-brand-600 bg-brand-50/50 dark:bg-brand-950/20 shadow-xs ring-1 ring-brand-500/30"
                          : "border-border bg-card hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground truncate">{r.name}</span>
                        {isOwner ? (
                          <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.2">
                            Owner
                          </span>
                        ) : (
                          <span className="rounded bg-muted text-muted-foreground text-[9px] font-semibold px-1.5 py-0.2">
                            {r._count?.organizationUsers || 0} Users
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                        {r.description || "System configured role"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Role 5D Permission Matrix */}
            <div className="lg:col-span-3 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
              {selectedRole ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-foreground">{selectedRole.name}</h2>
                        {selectedRole.name.includes("Administrator") && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            <Lock className="h-3 w-3" />
                            <span>Sole Owner Constraint Enforced</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedRole.description}</p>
                    </div>
                  </div>

                  {/* Matrix Table */}
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2.5">Module</th>
                          <th className="px-2 py-2.5 text-center">View</th>
                          <th className="px-2 py-2.5 text-center">Create</th>
                          <th className="px-2 py-2.5 text-center">Edit</th>
                          <th className="px-2 py-2.5 text-center">Delete</th>
                          <th className="px-2 py-2.5 text-center">Approve</th>
                          <th className="px-2 py-2.5 text-center">Export</th>
                          <th className="px-3 py-2.5">Record Visibility Scope</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {MODULES_LIST.map((mod) => {
                          const perm = (selectedRole.permissions || []).find((p: any) => p.module === mod.key) || {
                            canView: false,
                            canCreate: false,
                            canEdit: false,
                            canDelete: false,
                            canApprove: false,
                            canExport: false,
                            recordScope: "own",
                          };

                          const isOwner = selectedRole.name.includes("Administrator") || selectedRole.name.includes("Owner");

                          return (
                            <tr key={mod.key} className="hover:bg-muted/20">
                              <td className="px-3 py-2.5 font-bold text-foreground">{mod.label}</td>
                              <td className="px-2 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  disabled={isOwner}
                                  checked={perm.canView}
                                  onChange={(e) =>
                                    handleUpdatePermission(selectedRole.id, mod.key, "canView", e.target.checked)
                                  }
                                  className="rounded border-border text-brand-600 focus:ring-brand-500"
                                />
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  disabled={isOwner}
                                  checked={perm.canCreate}
                                  onChange={(e) =>
                                    handleUpdatePermission(selectedRole.id, mod.key, "canCreate", e.target.checked)
                                  }
                                  className="rounded border-border text-brand-600 focus:ring-brand-500"
                                />
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  disabled={isOwner}
                                  checked={perm.canEdit}
                                  onChange={(e) =>
                                    handleUpdatePermission(selectedRole.id, mod.key, "canEdit", e.target.checked)
                                  }
                                  className="rounded border-border text-brand-600 focus:ring-brand-500"
                                />
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  disabled={isOwner || mod.key === "invoices"}
                                  checked={perm.canDelete}
                                  onChange={(e) =>
                                    handleUpdatePermission(selectedRole.id, mod.key, "canDelete", e.target.checked)
                                  }
                                  className="rounded border-border text-brand-600 focus:ring-brand-500"
                                />
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  disabled={isOwner}
                                  checked={perm.canApprove}
                                  onChange={(e) =>
                                    handleUpdatePermission(selectedRole.id, mod.key, "canApprove", e.target.checked)
                                  }
                                  className="rounded border-border text-brand-600 focus:ring-brand-500"
                                />
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  disabled={isOwner}
                                  checked={perm.canExport}
                                  onChange={(e) =>
                                    handleUpdatePermission(selectedRole.id, mod.key, "canExport", e.target.checked)
                                  }
                                  className="rounded border-border text-brand-600 focus:ring-brand-500"
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <select
                                  disabled={isOwner}
                                  value={perm.recordScope || "own"}
                                  onChange={(e) =>
                                    handleUpdatePermission(selectedRole.id, mod.key, "recordScope", e.target.value)
                                  }
                                  className="rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-semibold text-foreground focus:outline-brand-500"
                                >
                                  <option value="own">👤 Own Records Only</option>
                                  <option value="team">👥 Team Records</option>
                                  <option value="department">🏢 Department Records</option>
                                  <option value="branch">📍 Branch Records</option>
                                  <option value="organization">🌐 Organization Wide</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground">Select a role to inspect permissions</div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Team & Users Management */}
        {activeTab === "users" && (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Organization Users & Roles</h3>
                <p className="text-xs text-muted-foreground">
                  Assign employees to departments, teams, and fine-grained enterprise roles
                </p>
              </div>
              <button
                onClick={() => setInviteModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Invite Team Member</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">User</th>
                    <th className="px-4 py-2.5">Assigned Role</th>
                    <th className="px-4 py-2.5">Department</th>
                    <th className="px-4 py-2.5">Team</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(settingsData?.users || []).map((ou: any) => (
                    <tr key={ou.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                            {ou.user?.firstName?.[0]}
                            {ou.user?.lastName?.[0]}
                          </div>
                          <div>
                            <span className="font-bold text-foreground">
                              {ou.user?.firstName} {ou.user?.lastName}
                            </span>
                            <p className="text-[10px] text-muted-foreground">{ou.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                          {ou.role?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{ou.department || "General"}</td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{ou.team || "Core"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Organization General */}
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
                    Remove sample transactions to start fresh with 100% real business data.
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

        {/* Tab 4: Branches */}
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

        {/* Tab 5: Custom Fields Studio */}
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
                  <p className="text-xs text-muted-foreground">
                    Target Model: <strong className="text-foreground capitalize">{f.modelName}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Automations */}
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
                        Trigger: <strong className="text-foreground">{rule.triggerType}</strong> on model{" "}
                        <strong className="text-foreground">{rule.modelName}</strong>
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

        {/* Tab 7: System Audit Logs */}
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
                          {log.oldValue ? `${log.oldValue} → ` : ""}
                          {log.newValue}
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

        {/* Invite User Modal */}
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
                <h3 className="font-bold text-sm text-foreground">Invite Team Member</h3>
                <button onClick={() => setInviteModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {inviteError && (
                <div className="m-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-500">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{inviteError}</span>
                </div>
              )}

              <form onSubmit={handleInviteUser} className="p-5 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Rahul"
                      value={inviteFirstName}
                      onChange={(e) => setInviteFirstName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Sharma"
                      value={inviteLastName}
                      onChange={(e) => setInviteLastName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Role Assignment *</label>
                  <select
                    required
                    value={inviteRoleId}
                    onChange={(e) => setInviteRoleId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600 font-semibold"
                  >
                    <option value="">-- Select Role --</option>
                    {(settingsData?.roles || []).map((r: any) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.name.includes("Administrator") ? "(Owner Only)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Department</label>
                    <select
                      value={inviteDepartment}
                      onChange={(e) => setInviteDepartment(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Finance">Finance & Accounting</option>
                      <option value="Operations">Operations / Warehouse</option>
                      <option value="Engineering">Engineering / Projects</option>
                      <option value="HR">Human Resources</option>
                      <option value="Support">Helpdesk & Support</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Team</label>
                    <input
                      type="text"
                      placeholder="e.g. Inside Sales"
                      value={inviteTeam}
                      onChange={(e) => setInviteTeam(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
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
