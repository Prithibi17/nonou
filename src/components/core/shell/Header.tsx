"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  Building2,
  GitBranch,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  User,
  LogOut,
  Settings,
  Grid,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency, formatRelativeTime, getInitials } from "@/lib/utils";

interface HeaderProps {
  userSession?: any;
  onRefresh?: () => void;
}

export function Header({ userSession, onRefresh }: HeaderProps) {
  const router = useRouter();
  const {
    activeOrgSlug,
    activeBranchId,
    setActiveBranchId,
    setCommandPaletteOpen,
    setQuickCreateOpen,
  } = useAppStore();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Keyboard shortcut Ctrl+K / Cmd+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCommandPaletteOpen]);

  // Fetch pending activities / notifications
  useEffect(() => {
    fetch("/api/chatter")
      .then((res) => res.json())
      .then((data) => {
        if (data.activities) {
          setNotifications(data.activities);
        }
      })
      .catch(() => {});
  }, []);

  const activeOrg = userSession?.activeOrg || {
    name: "TechCorp India Solutions",
    currencySymbol: "₹",
  };
  const branches = userSession?.branches || [];
  const currentBranch = branches.find((b: any) => b.id === activeBranchId) || branches[0] || { name: "Headquarters" };
  const user = userSession?.user || {
    firstName: "Prithibi",
    lastName: "Mandi",
    email: "prithibi@techcorp.in",
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md">
      {/* Left: Organization & Branch Switcher */}
      <div className="flex items-center gap-2">
        {/* Org Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setOrgDropdownOpen(!orgDropdownOpen);
              setBranchDropdownOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded bg-brand-600 text-[10px] font-bold text-white">
              {getInitials(activeOrg.name)}
            </div>
            <span className="max-w-[140px] truncate">{activeOrg.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {orgDropdownOpen && (
            <div className="absolute left-0 mt-1 w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Switch Organization
              </div>
              <div className="mt-1 space-y-0.5">
                {(userSession?.availableOrganizations || [activeOrg]).map((org: any) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setOrgDropdownOpen(false);
                      // In a full app this would reload org context
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="h-4 w-4 text-brand-600" />
                      <span className="truncate">{org.name}</span>
                    </div>
                    {org.id === activeOrg.id && <span className="text-[10px] text-brand-600 font-bold">Active</span>}
                  </button>
                ))}
              </div>
              <div className="mt-2 border-t border-border pt-1">
                <Link
                  href="/onboarding"
                  onClick={() => setOrgDropdownOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Create Organization</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Branch Selector */}
        {branches.length > 0 && (
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                setBranchDropdownOpen(!branchDropdownOpen);
                setOrgDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <GitBranch className="h-3.5 w-3.5 text-indigo-500" />
              <span className="max-w-[130px] truncate">{currentBranch.name}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {branchDropdownOpen && (
              <div className="absolute left-0 mt-1 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Select Branch
                </div>
                <button
                  onClick={() => {
                    setActiveBranchId(null);
                    setBranchDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  <span>All Branches (Consolidated)</span>
                  {activeBranchId === null && <span className="text-[10px] text-brand-600 font-bold">✓</span>}
                </button>
                {branches.map((b: any) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBranchId(b.id);
                      setBranchDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-muted truncate"
                  >
                    <span className="truncate">{b.name}</span>
                    {activeBranchId === b.id && <span className="text-[10px] text-brand-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center: Global Command / Search Bar */}
      <div className="flex max-w-md flex-1 px-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground hover:border-brand-400 hover:bg-background transition-all shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Search anything or type <code className="text-[11px] font-mono text-brand-600">/</code> for commands...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick "+ New", Notification Bell, User Avatar */}
      <div className="flex items-center gap-2">
        {/* Universal Quick Create */}
        <div className="relative">
          <button
            onClick={() => setQuickCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 active:scale-95 transition-all shadow-sm shadow-brand-500/20"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>

        {/* Notifications / Activity Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Bell className="h-4 w-4" />
            {notifications.filter((n) => !n.isDone).length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow">
                {notifications.filter((n) => !n.isDone).length}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-foreground">Scheduled Activities</span>
                <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">
                  {notifications.filter((n) => !n.isDone).length} Pending
                </span>
              </div>
              <div className="mt-2 max-h-72 space-y-2 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No upcoming activities scheduled.
                  </div>
                ) : (
                  notifications.map((act) => (
                    <div
                      key={act.id}
                      className={`rounded-lg border p-2 text-xs transition-colors ${
                        act.isDone ? "border-border bg-muted/40 opacity-60" : "border-indigo-100 bg-indigo-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          {act.activityType === "call" && <Phone className="h-3.5 w-3.5 text-blue-500" />}
                          {act.activityType === "meeting" && <Calendar className="h-3.5 w-3.5 text-purple-500" />}
                          {act.activityType === "email" && <Mail className="h-3.5 w-3.5 text-amber-500" />}
                          {act.activityType === "todo" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                          <span className="capitalize">{act.activityType}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelativeTime(act.dueDate)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{act.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-sm ring-1 ring-border">
              {getInitials(`${user.firstName} ${user.lastName}`)}
            </div>
            <div className="hidden lg:flex flex-col text-left text-xs">
              <span className="font-semibold text-foreground leading-none">{user.firstName}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{userSession?.role?.name || "Administrator"}</span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden lg:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-bold text-foreground truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <div className="mt-1 space-y-0.5">
                <Link
                  href="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-muted text-foreground"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Platform Settings</span>
                </Link>
                <Link
                  href="/apps"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-muted text-foreground"
                >
                  <Grid className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>App Marketplace</span>
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Onboarding Wizard</span>
                </Link>
                <div className="border-t border-border pt-1 mt-1">
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      window.location.href = "/login";
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
