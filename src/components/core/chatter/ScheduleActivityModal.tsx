"use client";

import React, { useState } from "react";
import { X, Calendar, Phone, Mail, CheckCircle2, Clock, Upload, User } from "lucide-react";
import { ActivityType } from "@/types";

interface ScheduleActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordType: string;
  recordId: string;
  recordTitle: string;
  onSuccess?: () => void;
}

export function ScheduleActivityModal({
  isOpen,
  onClose,
  recordType,
  recordId,
  recordTitle,
  onSuccess,
}: ScheduleActivityModalProps) {
  const [activityType, setActivityType] = useState<ActivityType>("call");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/chatter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "schedule_activity",
          recordType,
          recordId,
          activityType,
          summary,
          notes,
          dueDate,
        }),
      });
      onSuccess && onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const ACTIVITY_TYPES: { id: ActivityType; label: string; icon: any; color: string }[] = [
    { id: "call", label: "Phone Call", icon: Phone, color: "text-blue-500" },
    { id: "meeting", label: "Meeting / Demo", icon: Calendar, color: "text-purple-500" },
    { id: "email", label: "Follow-up Email", icon: Mail, color: "text-amber-500" },
    { id: "todo", label: "To-Do / Task", icon: CheckCircle2, color: "text-emerald-500" },
    { id: "upload", label: "Upload Document", icon: Upload, color: "text-indigo-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Schedule Activity</h3>
              <p className="text-[11px] text-muted-foreground truncate max-w-[260px]">{recordTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Activity Type</label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = activityType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActivityType(t.id)}
                    className={`flex items-center gap-2 rounded-xl p-2 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-brand-50 border border-brand-200 text-brand-900 shadow-xs"
                        : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${t.color}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Summary *</label>
            <input
              type="text"
              required
              placeholder="e.g. Discuss revised proposal & SLA terms"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Due Date</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Notes / Instructions</label>
            <textarea
              rows={2}
              placeholder="Add extra context or checklist for this activity..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 shadow-sm"
            >
              {loading ? "Scheduling..." : "Schedule Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
