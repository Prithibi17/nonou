"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Target,
  FileText,
  Receipt,
  Package,
  CheckSquare,
  Users,
  LayoutDashboard,
  Settings,
  Grid,
  PlusCircle,
  X,
  ArrowRight,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { SearchResultItem } from "@/core/search/command-engine";

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, setQuickCreateOpen } = useAppStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchResults("");
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  const fetchResults = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setSelectedIndex(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    fetchResults(val);
  };

  const handleSelect = (item: SearchResultItem) => {
    setCommandPaletteOpen(false);
    if (item.type === "action") {
      if (item.url.includes("action=new")) {
        const module = item.url.split("?")[0].replace("/", "");
        setQuickCreateOpen(true, module);
      } else {
        router.push(item.url);
      }
    } else {
      router.push(item.url);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setCommandPaletteOpen(false);
    }
  };

  if (!commandPaletteOpen) return null;

  const renderIcon = (type: string, iconName?: string) => {
    switch (type) {
      case "contact":
        return <Users className="h-4 w-4 text-rose-500" />;
      case "lead":
        return <Target className="h-4 w-4 text-indigo-500" />;
      case "quotation":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "invoice":
        return <Receipt className="h-4 w-4 text-emerald-500" />;
      case "product":
        return <Package className="h-4 w-4 text-amber-500" />;
      case "task":
        return <CheckSquare className="h-4 w-4 text-sky-500" />;
      case "action":
        return <PlusCircle className="h-4 w-4 text-brand-600" />;
      default:
        return <ArrowRight className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 border-b border-border bg-background">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search records, contacts, invoices or type / for commands..."
            className="h-14 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button onClick={() => handleQueryChange("")} className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-muted"
          >
            ESC
          </button>
        </div>

        {/* Quick Filter Hints */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-muted/30 text-[11px] text-muted-foreground">
          <span>Quick hints:</span>
          <button onClick={() => handleQueryChange("/create")} className="rounded bg-card px-1.5 py-0.5 border border-border hover:text-foreground">
            /create
          </button>
          <button onClick={() => handleQueryChange("/new")} className="rounded bg-card px-1.5 py-0.5 border border-border hover:text-foreground">
            /new
          </button>
          <button onClick={() => handleQueryChange("Reliance")} className="rounded bg-card px-1.5 py-0.5 border border-border hover:text-foreground">
            Reliance
          </button>
          <button onClick={() => handleQueryChange("INV")} className="rounded bg-card px-1.5 py-0.5 border border-border hover:text-foreground">
            INV
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {loading && (
            <div className="py-8 text-center text-xs text-muted-foreground">Searching BusinessOS kernel...</div>
          )}

          {!loading && results.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching records or commands found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading &&
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer transition-colors ${
                    isSelected ? "bg-brand-50 text-brand-900 font-medium" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border shadow-xs">
                      {renderIcon(item.type, item.iconName)}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-semibold truncate">{item.title}</span>
                      <span className="text-[11px] text-muted-foreground truncate">{item.subtitle}</span>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${item.badgeColor || "bg-muted text-muted-foreground"}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
        </div>

        {/* Bottom Legend */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[10px] font-medium text-brand-600">BusinessOS Search Engine</span>
        </div>
      </div>
    </div>
  );
}
