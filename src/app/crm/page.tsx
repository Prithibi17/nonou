"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/core/shell/AppShell";
import {
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
} from "@/components/core/kanban/KanbanBoard";
import { DataTable } from "@/components/core/data-table/DataTable";
import { UniversalCalendarView } from "@/components/core/calendar/UniversalCalendarView";
import { FilterBuilderModal } from "@/components/core/filter-builder/FilterBuilderModal";
import { GroupByBar } from "@/components/core/filter-builder/GroupByBar";
import { ChatterPanel } from "@/components/core/chatter/ChatterPanel";
import {
  LayoutGrid,
  List,
  Calendar,
  Plus,
  Target,
  Building2,
  TrendingUp,
  X,
  User,
  Phone,
  Mail,
  Clock,
  Sparkles,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatCompactNumber, formatDate } from "@/lib/utils";
import { FilterGroup, FieldDefinition, LeadItem, CRMStageItem } from "@/types";
import { filterRecords } from "@/core/filters/filter-engine";
import { useAppStore } from "@/store/useAppStore";

const CRM_FIELDS: FieldDefinition[] = [
  { name: "name", label: "Opportunity Name", type: "text" },
  { name: "companyName", label: "Company", type: "text" },
  { name: "contactName", label: "Contact Person", type: "text" },
  { name: "expectedRevenue", label: "Expected Revenue (₹)", type: "currency" },
  { name: "probability", label: "Probability (%)", type: "number" },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { label: "Low", value: "Low" },
      { label: "Medium", value: "Medium" },
      { label: "High", value: "High" },
      { label: "Urgent", value: "Urgent" },
    ],
  },
  { name: "source", label: "Lead Source", type: "text" },
  { name: "createdAt", label: "Created Date", type: "date" },
];

export default function CRMPage() {
  const { setQuickCreateOpen } = useAppStore();
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar">("kanban");
  const [stages, setStages] = useState<CRMStageItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter & Group By State
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterGroup | null>(null);
  const [activeGroupBy, setActiveGroupBy] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<any[]>([]);

  const fetchCRMData = async () => {
    try {
      const [crmRes, filterRes] = await Promise.all([
        fetch("/api/crm"),
        fetch("/api/saved-filters?modelName=lead"),
      ]);
      const crmData = await crmRes.json();
      const filterData = await filterRes.json();

      setStages(crmData.stages || []);
      setLeads(crmData.leads || []);
      setSavedFilters(filterData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, []);

  const handleStageChange = async (leadId: string, newStageId: string) => {
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stageId: newStageId } : l))
    );

    try {
      await fetch("/api/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, stageId: newStageId }),
      });
    } catch (e) {
      console.error(e);
      fetchCRMData();
    }
  };

  // Apply Filter Engine
  const filteredLeads = filterRecords(leads, activeFilter);

  // Convert to Kanban items
  const kanbanColumns: KanbanColumn[] = stages.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    probability: s.probability,
    isWon: s.isWon,
  }));

  const kanbanItems: KanbanItem[] = filteredLeads.map((l) => ({
    id: l.id,
    columnId: l.stageId,
    title: l.name,
    subtitle: l.companyName,
    value: l.expectedRevenue,
    priority: l.priority,
    tags: l.tags,
    assignedTo: l.assignedTo,
  }));

  // Convert to Calendar events
  const calendarEvents = filteredLeads.map((l) => ({
    id: l.id,
    title: `${l.name} (${formatCompactNumber(l.expectedRevenue)})`,
    date: l.expectedClosing || l.createdAt,
    color: l.stage?.color || "#6366f1",
  }));

  // List View Columns
  const columns: ColumnDef<LeadItem>[] = [
    {
      accessorKey: "name",
      header: "Opportunity Name",
      cell: ({ row }) => (
        <div className="font-semibold text-foreground flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-indigo-500" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "companyName",
      header: "Company",
      cell: ({ row }) => row.original.companyName || "-",
    },
    {
      accessorKey: "expectedRevenue",
      header: "Expected Revenue",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.original.expectedRevenue)}
        </span>
      ),
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }) => (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs"
          style={{ backgroundColor: row.original.stage?.color || "#6366f1" }}
        >
          {row.original.stage?.name}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <span
          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
            row.original.priority === "Urgent"
              ? "bg-red-100 text-red-800"
              : row.original.priority === "High"
              ? "bg-amber-100 text-amber-800"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {row.original.priority}
        </span>
      ),
    },
    {
      accessorKey: "assignedTo",
      header: "Salesperson",
      cell: ({ row }) =>
        row.original.assignedTo
          ? `${row.original.assignedTo.firstName} ${row.original.assignedTo.lastName}`
          : "Unassigned",
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Top Header & View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-200">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CRM & Opportunities</h1>
              <p className="text-xs text-muted-foreground">
                {filteredLeads.length} Deals • Total Pipeline:{" "}
                <strong className="text-foreground">
                  {formatCurrency(filteredLeads.reduce((a, b) => a + (b.expectedRevenue || 0), 0))}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="flex rounded-xl border border-border bg-card p-1 shadow-2xs">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  viewMode === "kanban"
                    ? "bg-brand-50 text-brand-700 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  viewMode === "list"
                    ? "bg-brand-50 text-brand-700 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  viewMode === "calendar"
                    ? "bg-brand-50 text-brand-700 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Calendar</span>
              </button>
            </div>

            {/* Quick Create Deal */}
            <button
              onClick={() => setQuickCreateOpen(true, "lead")}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Deal</span>
            </button>
          </div>
        </div>

        {/* Universal Filter & Group By Bar */}
        <GroupByBar
          fields={CRM_FIELDS}
          activeGroupBy={activeGroupBy}
          onGroupByChange={setActiveGroupBy}
          onOpenFilterBuilder={() => setFilterModalOpen(true)}
          activeFilterCount={activeFilter?.conditions.length || 0}
          onClearFilter={() => setActiveFilter(null)}
          savedFilters={savedFilters}
          onApplySavedFilter={setActiveFilter}
        />

        {/* View Content */}
        {viewMode === "kanban" && (
          <KanbanBoard
            columns={kanbanColumns}
            items={kanbanItems}
            onItemMoved={handleStageChange}
            onItemClick={(item) => {
              const lead = leads.find((l) => l.id === item.id);
              if (lead) setSelectedLead(lead);
            }}
            onQuickAdd={(columnId) => {
              setQuickCreateOpen(true, "lead");
            }}
          />
        )}

        {viewMode === "list" && (
          <DataTable
            columns={columns}
            data={filteredLeads}
            searchPlaceholder="Search opportunities by name or company..."
            onRowClick={(lead) => setSelectedLead(lead)}
          />
        )}

        {viewMode === "calendar" && (
          <UniversalCalendarView
            events={calendarEvents}
            onEventClick={(evt) => {
              const lead = leads.find((l) => l.id === evt.id);
              if (lead) setSelectedLead(lead);
            }}
          />
        )}

        {/* Filter Builder Modal */}
        <FilterBuilderModal
          isOpen={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          fields={CRM_FIELDS}
          initialFilter={activeFilter}
          onApply={setActiveFilter}
          modelName="lead"
        />

        {/* Lead Detail & Chatter Drawer */}
        {selectedLead && (
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground truncate max-w-xs">{selectedLead.name}</h3>
                  <span className="text-[11px] text-muted-foreground">{selectedLead.companyName || "Independent Lead"}</span>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stage Pipeline Breadcrumbs */}
            <div className="flex items-center border-b border-border bg-muted/40 px-5 py-2.5 overflow-x-auto gap-1 text-[11px]">
              {stages.map((stage) => {
                const isActive = stage.id === selectedLead.stageId;
                return (
                  <button
                    key={stage.id}
                    onClick={() => {
                      handleStageChange(selectedLead.id, stage.id);
                      setSelectedLead({ ...selectedLead, stageId: stage.id, stage });
                    }}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition-all shrink-0 ${
                      isActive
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {stage.name}
                  </button>
                );
              })}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 border-b border-border p-4 bg-card">
              <div className="rounded-xl border border-border p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Value</span>
                <p className="text-sm font-bold text-foreground mt-0.5">{formatCurrency(selectedLead.expectedRevenue)}</p>
              </div>
              <div className="rounded-xl border border-border p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Probability</span>
                <p className="text-sm font-bold text-indigo-600 mt-0.5">{selectedLead.probability}%</p>
              </div>
              <div className="rounded-xl border border-border p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Priority</span>
                <p className="text-sm font-bold text-foreground mt-0.5">{selectedLead.priority}</p>
              </div>
            </div>

            {/* Universal Chatter Stream */}
            <div className="flex-1 overflow-hidden">
              <ChatterPanel
                recordType="lead"
                recordId={selectedLead.id}
                recordTitle={selectedLead.name}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
