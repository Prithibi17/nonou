import { create } from "zustand";
import { ViewMode, FilterGroup } from "@/types";

interface AppState {
  activeOrgId: string;
  activeOrgSlug: string;
  activeBranchId: string | null;
  activeApp: string;
  commandPaletteOpen: boolean;
  quickCreateOpen: boolean;
  quickCreateType: string | null;
  activityModalOpen: boolean;
  activeRecordForActivity: { type: string; id: string; title: string } | null;
  moduleViewModes: Record<string, ViewMode>;
  activeFilters: Record<string, FilterGroup | null>;
  activeGroupBy: Record<string, string | null>;

  setActiveOrg: (id: string, slug: string) => void;
  setActiveBranchId: (branchId: string | null) => void;
  setActiveApp: (app: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickCreateOpen: (open: boolean, type?: string | null) => void;
  setActivityModalOpen: (open: boolean, record?: { type: string; id: string; title: string } | null) => void;
  setViewMode: (module: string, mode: ViewMode) => void;
  setActiveFilter: (module: string, filter: FilterGroup | null) => void;
  setActiveGroupBy: (module: string, groupBy: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeOrgId: "",
  activeOrgSlug: "techcorp",
  activeBranchId: null,
  activeApp: "dashboard",
  commandPaletteOpen: false,
  quickCreateOpen: false,
  quickCreateType: null,
  activityModalOpen: false,
  activeRecordForActivity: null,
  moduleViewModes: {
    crm: "kanban",
    sales: "list",
    invoices: "list",
    products: "list",
    projects: "kanban",
    contacts: "list",
  },
  activeFilters: {},
  activeGroupBy: {},

  setActiveOrg: (id, slug) => set({ activeOrgId: id, activeOrgSlug: slug }),
  setActiveBranchId: (branchId) => set({ activeBranchId: branchId }),
  setActiveApp: (app) => set({ activeApp: app }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setQuickCreateOpen: (open, type = null) => set({ quickCreateOpen: open, quickCreateType: type }),
  setActivityModalOpen: (open, record = null) =>
    set({ activityModalOpen: open, activeRecordForActivity: record }),
  setViewMode: (module, mode) =>
    set((state) => ({
      moduleViewModes: { ...state.moduleViewModes, [module]: mode },
    })),
  setActiveFilter: (module, filter) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, [module]: filter },
    })),
  setActiveGroupBy: (module, groupBy) =>
    set((state) => ({
      activeGroupBy: { ...state.activeGroupBy, [module]: groupBy },
    })),
}));
