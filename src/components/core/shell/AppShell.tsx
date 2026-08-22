"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { CommandPalette } from "../command-palette/CommandPalette";
import { QuickCreateModal } from "./QuickCreateModal";
import { useAppStore } from "@/store/useAppStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { setActiveOrg, setActiveBranchId } = useAppStore();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (!data.authenticated) {
          router.push("/login");
          return;
        }
        if (!data.hasOrganization) {
          router.push("/onboarding");
          return;
        }
        setSession(data);
        if (data.activeOrg) {
          setActiveOrg(data.activeOrg.id, data.activeOrg.slug);
        }
        if (data.activeBranchId) {
          setActiveBranchId(data.activeBranchId);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router, setActiveOrg, setActiveBranchId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <span className="text-xs font-semibold text-muted-foreground">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Universal Modular Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pl-60 min-w-0">
        <Header userSession={session} />
        <main className="flex-1 p-6 overflow-y-auto min-w-0">{children}</main>
      </div>

      {/* Universal Command Bar Modal */}
      <CommandPalette />

      {/* Universal Quick Create Modal */}
      <QuickCreateModal />
    </div>
  );
}
