"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Filter,
  Save,
  Check,
  Calendar,
  Layers,
  ChevronDown,
} from "lucide-react";
import {
  FilterGroup,
  FilterCondition,
  FilterOperator,
  FieldDefinition,
} from "@/types";
import { generateUUID } from "@/lib/utils";

interface FilterBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FieldDefinition[];
  initialFilter?: FilterGroup | null;
  onApply: (filter: FilterGroup | null) => void;
  modelName: string;
}

export function FilterBuilderModal({
  isOpen,
  onClose,
  fields,
  initialFilter,
  onApply,
  modelName,
}: FilterBuilderModalProps) {
  const [filter, setFilter] = useState<FilterGroup>(
    initialFilter || {
      id: generateUUID(),
      operator: "AND",
      conditions: [
        {
          id: generateUUID(),
          field: fields[0]?.name || "name",
          operator: "contains",
          value: "",
        },
      ],
    }
  );

  const [saveName, setSaveName] = useState("");
  const [showSaveBox, setShowSaveBox] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleOperatorChange = (op: "AND" | "OR") => {
    setFilter({ ...filter, operator: op });
  };

  const addCondition = () => {
    const newCond: FilterCondition = {
      id: generateUUID(),
      field: fields[0]?.name || "name",
      operator: "contains",
      value: "",
    };
    setFilter({
      ...filter,
      conditions: [...filter.conditions, newCond],
    });
  };

  const removeCondition = (index: number) => {
    const next = [...filter.conditions];
    next.splice(index, 1);
    setFilter({ ...filter, conditions: next });
  };

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    const next = [...filter.conditions];
    const current = next[index] as FilterCondition;
    next[index] = { ...current, ...updates };
    setFilter({ ...filter, conditions: next });
  };

  const handleApply = () => {
    if (filter.conditions.length === 0) {
      onApply(null);
    } else {
      onApply(filter);
    }
    onClose();
  };

  const handleClear = () => {
    onApply(null);
    onClose();
  };

  const handleSaveFilter = async () => {
    if (!saveName.trim()) return;
    try {
      await fetch("/api/saved-filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveName,
          modelName,
          filterJson: filter,
          isDefault: false,
          isShared: true,
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowSaveBox(false);
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const getOperatorsForField = (fieldName: string): { label: string; value: FilterOperator }[] => {
    const field = fields.find((f) => f.name === fieldName);
    if (!field) return [{ label: "Contains", value: "contains" }];

    switch (field.type) {
      case "number":
      case "currency":
        return [
          { label: "Greater Than (>)", value: "gt" },
          { label: "Greater Than / Equal (≥)", value: "gte" },
          { label: "Less Than (<)", value: "lt" },
          { label: "Less Than / Equal (≤)", value: "lte" },
          { label: "Equals (=)", value: "equals" },
          { label: "Between Range", value: "between" },
        ];
      case "date":
        return [
          { label: "Today", value: "today" },
          { label: "Yesterday", value: "yesterday" },
          { label: "Tomorrow", value: "tomorrow" },
          { label: "This Week", value: "this_week" },
          { label: "This Month", value: "this_month" },
          { label: "Last 30 Days", value: "last_30_days" },
          { label: "Next 30 Days", value: "next_30_days" },
          { label: "Date Range (Between)", value: "date_between" },
          { label: "Is Set", value: "is_set" },
        ];
      case "boolean":
        return [
          { label: "Is True (Yes)", value: "is_true" },
          { label: "Is False (No)", value: "is_false" },
        ];
      default:
        return [
          { label: "Contains", value: "contains" },
          { label: "Does Not Contain", value: "not_contains" },
          { label: "Equals", value: "equals" },
          { label: "Starts With", value: "starts_with" },
          { label: "Ends With", value: "ends_with" },
          { label: "Is Set", value: "is_set" },
          { label: "Is Empty", value: "is_not_set" },
        ];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Advanced Query & Filter Engine</h3>
              <p className="text-[11px] text-muted-foreground">Build compound AND / OR queries across records</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Builder Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Operator Mode Selector (AND / OR) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Match:</span>
            <div className="flex rounded-lg border border-border bg-muted/50 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleOperatorChange("AND")}
                className={`rounded-md px-3 py-1 transition-colors ${
                  filter.operator === "AND" ? "bg-card text-brand-600 shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ALL conditions (AND)
              </button>
              <button
                type="button"
                onClick={() => handleOperatorChange("OR")}
                className={`rounded-md px-3 py-1 transition-colors ${
                  filter.operator === "OR" ? "bg-card text-brand-600 shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ANY condition (OR)
              </button>
            </div>
          </div>

          {/* Conditions List */}
          <div className="space-y-2.5">
            {filter.conditions.map((item, index) => {
              const cond = item as FilterCondition;
              const fieldDef = fields.find((f) => f.name === cond.field);
              const opList = getOperatorsForField(cond.field);
              const isDatePreset = ["today", "yesterday", "tomorrow", "this_week", "this_month", "last_30_days", "next_30_days", "is_set", "is_not_set", "is_true", "is_false"].includes(cond.operator);

              return (
                <div
                  key={cond.id || index}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/20 p-2.5 shadow-2xs"
                >
                  {/* Field Selector */}
                  <select
                    value={cond.field}
                    onChange={(e) => {
                      const newField = e.target.value;
                      const newOps = getOperatorsForField(newField);
                      updateCondition(index, {
                        field: newField,
                        operator: newOps[0].value,
                        value: "",
                      });
                    }}
                    className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-brand-600"
                  >
                    {fields.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.label}
                      </option>
                    ))}
                  </select>

                  {/* Operator Selector */}
                  <select
                    value={cond.operator}
                    onChange={(e) => updateCondition(index, { operator: e.target.value as FilterOperator })}
                    className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-brand-600"
                  >
                    {opList.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  {/* Value Input */}
                  {!isDatePreset && (
                    <>
                      {cond.operator === "between" || cond.operator === "date_between" ? (
                        <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                          <input
                            type={fieldDef?.type === "number" || fieldDef?.type === "currency" ? "number" : "date"}
                            placeholder="From"
                            value={cond.value || ""}
                            onChange={(e) => updateCondition(index, { value: e.target.value })}
                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-brand-600"
                          />
                          <span className="text-xs text-muted-foreground">and</span>
                          <input
                            type={fieldDef?.type === "number" || fieldDef?.type === "currency" ? "number" : "date"}
                            placeholder="To"
                            value={cond.valueTo || ""}
                            onChange={(e) => updateCondition(index, { valueTo: e.target.value })}
                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-brand-600"
                          />
                        </div>
                      ) : fieldDef?.type === "select" && fieldDef.options ? (
                        <select
                          value={cond.value || ""}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                          className="flex-1 min-w-[140px] rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-brand-600"
                        >
                          <option value="">Select option...</option>
                          {fieldDef.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={fieldDef?.type === "number" || fieldDef?.type === "currency" ? "number" : "text"}
                          placeholder="Enter comparison value..."
                          value={cond.value || ""}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                          className="flex-1 min-w-[140px] rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-brand-600"
                        />
                      )}
                    </>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Condition Button */}
          <button
            type="button"
            onClick={addCondition}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-brand-600 hover:border-brand-400 hover:bg-brand-50/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Condition</span>
          </button>

          {/* Save Filter Box */}
          {showSaveBox ? (
            <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2 animate-in fade-in">
              <span className="text-xs font-bold text-foreground">Save as Custom Filter</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. High Value Indian Leads (> ₹1 Lakh)"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-brand-600"
                />
                <button
                  type="button"
                  onClick={handleSaveFilter}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  {saveSuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Save className="h-3.5 w-3.5" />}
                  <span>{saveSuccess ? "Saved!" : "Save"}</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSaveBox(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
            >
              <Save className="h-3 w-3" />
              <span>Save current query as a reusable filter...</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-muted/20">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            Clear All
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
