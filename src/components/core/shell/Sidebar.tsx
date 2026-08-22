"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  FileText,
  Receipt,
  Package,
  FolderKanban,
  Users,
  Grid,
  Settings,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userSession?: any;
}

const NAV_ITEMS = [
  {
    key: "dashboard",
    module: null,
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    key: "crm",
    module: "crm",
    label: "CRM & Leads",
    href: "/crm",
    icon: Target,
    badge: null,
    color: "text-indigo-500",
  },
  {
    key: "sales",
    module: "sales",
    label: "Sales & Quotes",
    href: "/sales",
    icon: FileText,
    badge: null,
    color: "text-blue-500",
  },
  {
    key: "invoices",
    module: "invoices",
    label: "Invoicing & GST",
    href: "/invoices",
    icon: Receipt,
    badge: null,
    color: "text-emerald-500",
  },
  {
    key: "products",
    module: "products",
    label: "Product Master",
    href: "/products",
    icon: Package,
    badge: null,
    color: "text-amber-500",
  },
  {
    key: "projects",
    module: "projects",
    label: "Projects & Tasks",
    href: "/projects",
    icon: FolderKanban,
    badge: null,
    color: "text-purple-500",
  },
  {
    key: "contacts",
    module: "contacts",
    label: "Contacts",
    href: "/contacts",
    icon: Users,
    badge: null,
    color: "text-rose-500",
  },
];

export function Sidebar({ userSession }: SidebarProps) {
  const pathname = usePathname();

  const isOwner =
    userSession?.role?.name?.includes("Administrator") ||
    userSession?.role?.name?.includes("Owner") ||
    userSession?.user?.isSuperAdmin;

  const permissions = userSession?.permissions || [];

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.module) return true;
    if (isOwner) return true;
    const perm = permissions.find((p: any) => p.module === item.module);
    return perm ? perm.canView : true;
  });

  const canViewSettings = isOwner || permissions.some((p: any) => p.module === "settings" && p.canView);

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex w-60 flex-col border-r border-border bg-card/95 backdrop-blur-md">
      {/* Brand Logo & Platform Title */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-400 text-white shadow-md shadow-brand-500/25">
          <Layers className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-foreground tracking-tight flex items-center gap-1.5">
            BusinessOS
            <span className="rounded bg-brand-50 px-1 py-0.2 text-[9px] font-bold text-brand-600 border border-brand-200">
              V1
            </span>
          </span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
            {userSession?.activeOrg?.name || "Business Kernel"}
          </span>
        </div>
      </div>

      {/* Navigation Modules */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Core Modules
          </div>
          <nav className="space-y-0.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all",
                    isActive
                      ? "bg-brand-50 text-brand-700 font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-110",
                        isActive ? "text-brand-600" : "text-muted-foreground"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                        isActive
                          ? "bg-brand-200 text-brand-800"
                          : "bg-muted text-muted-foreground group-hover:bg-background"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Platform Apps & Configuration */}
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Platform Kernel
          </div>
          <nav className="space-y-0.5">
            <Link
              href="/apps"
              className={cn(
                "group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all",
                pathname.startsWith("/apps")
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Grid className="h-4 w-4 text-slate-500 group-hover:rotate-12 transition-transform" />
                <span>App Marketplace</span>
              </div>
              <span className="rounded bg-indigo-50 px-1 py-0.2 text-[9px] font-bold text-indigo-600">
                12 Apps
              </span>
            </Link>

            {canViewSettings && (
              <Link
                href="/settings"
                className={cn(
                  "group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all",
                  pathname.startsWith("/settings")
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-slate-500 group-hover:rotate-45 transition-transform" />
                  <span>Settings & RBAC</span>
                </div>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* User Role Badge in Sidebar Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2 border border-border/60">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-bold text-foreground truncate">
              {userSession?.role?.name || "Administrator"}
            </span>
            <span className="text-[9px] text-muted-foreground truncate">
              {userSession?.department ? `${userSession.department} • ` : ""}{userSession?.team || "Organization Scope"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
