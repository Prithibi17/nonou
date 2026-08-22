"use client";

import React, { useState } from "react";
import { Filter, Layers, ChevronDown, X, Bookmark, Sparkles } from "lucide-react";
import { FieldDefinition, FilterGroup } from "@/types";

interface GroupByBarProps {
  fields: FieldDefinition[];
  activeGroupBy: string | null;
  onGroupByChange: (field: string | null) => void;
  onOpenFilterBuilder: () => void;
  activeFilterCount: number;
  onClearFilter: () => void;
  savedFilters?: { id: string; name: string; filterJson: string }[];
  onApplySavedFilter?: (filter: FilterGroup) => void;
}

export function GroupByBar({
  fields,
  activeGroupBy,
  onGroupByChange,
  onOpenFilterBuilder,
  activeFilterCount,
  onClearFilter,
  savedFilters = [],
  onApplySavedFilter,
}: GroupByBarProps) {
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [savedDropdownOpen, setSavedDropdownOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/40 px-4 py-2 text-xs">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Custom Filter Trigger Button */}
        <button
          onClick={onOpenFilterBuilder}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium transition-colors shadow-2xs ${
            activeFilterCount > 0
              ? "border-brand-300 bg-brand-50 text-brand-700 font-semibold"
              : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear Filter Pill */}
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilter}
            className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <span>Reset</span>
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Group By Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setGroupDropdownOpen(!groupDropdownOpen);
              setSavedDropdownOpen(false);
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium transition-colors shadow-2xs ${
              activeGroupBy
                ? "border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Group By{activeGroupBy ? `: ${fields.find((f) => f.name === activeGroupBy)?.label || activeGroupBy}` : ""}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {groupDropdownOpen && (
            <div className="absolute left-0 mt-1 w-52 rounded-xl border border-border bg-card p-1.5 shadow-xl z-30 animate-in fade-in">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Group Records By
              </div>
              <button
                onClick={() => {
                  onGroupByChange(null);
                  setGroupDropdownOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                <span>None (Flat List)</span>
                {activeGroupBy === null && <span className="text-brand-600 font-bold">✓</span>}
              </button>
              {fields.map((field) => (
                <button
                  key={field.name}
                  onClick={() => {
                    onGroupByChange(field.name);
                    setGroupDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <span>{field.label}</span>
                  {activeGroupBy === field.name && <span className="text-brand-600 font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Saved Filters Dropdown */}
        {savedFilters.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                setSavedDropdownOpen(!savedDropdownOpen);
                setGroupDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <Bookmark className="h-3.5 w-3.5 text-amber-500" />
              <span>Saved Searches ({savedFilters.length})</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {savedDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl z-30 animate-in fade-in">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Saved Filters
                </div>
                {savedFilters.map((sf) => (
                  <button
                    key={sf.id}
                    onClick={() => {
                      try {
                        const parsed = typeof sf.filterJson === "string" ? JSON.parse(sf.filterJson) : sf.filterJson;
                        onApplySavedFilter && onApplySavedFilter(parsed);
                      } catch (e) {
                        console.error(e);
                      }
                      setSavedDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <span className="truncate">{sf.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Group By Tag */}
      {activeGroupBy && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span>Grouped by</span>
          <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 font-semibold text-indigo-700">
            {fields.find((f) => f.name === activeGroupBy)?.label || activeGroupBy}
          </span>
          <button onClick={() => onGroupByChange(null)} className="rounded p-0.5 hover:bg-muted">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
