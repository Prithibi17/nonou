"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Clock,
  History,
  Paperclip,
  Send,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Plus,
  User,
} from "lucide-react";
import { formatRelativeTime, formatDate, getInitials } from "@/lib/utils";
import { ScheduleActivityModal } from "./ScheduleActivityModal";

interface ChatterPanelProps {
  recordType: string;
  recordId: string;
  recordTitle: string;
}

export function ChatterPanel({ recordType, recordId, recordTitle }: ChatterPanelProps) {
  const [activeTab, setActiveTab] = useState<"chatter" | "activities" | "audit">("chatter");
  const [comments, setComments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);

  const fetchChatter = async () => {
    try {
      const res = await fetch(`/api/chatter?recordType=${recordType}&recordId=${recordId}`);
      const data = await res.json();
      setComments(data.comments || []);
      setActivities(data.activities || []);
      setAuditLogs(data.auditLogs || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (recordId) fetchChatter();
  }, [recordId, recordType]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/chatter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "comment",
          recordType,
          recordId,
          content: newComment,
        }),
      });
      setNewComment("");
      fetchChatter();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDone = async (activityId: string) => {
    try {
      await fetch("/api/chatter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "mark_done",
          activityId,
        }),
      });
      fetchChatter();
    } catch (e) {
      console.error(e);
    }
  };

  // Combine comments and audit logs for unified stream
  const timelineEvents = [
    ...comments.map((c) => ({ ...c, eventType: "comment", date: new Date(c.createdAt) })),
    ...auditLogs.map((a) => ({ ...a, eventType: "audit", date: new Date(a.createdAt) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex h-full flex-col border-l border-border bg-card/60 backdrop-blur-xs">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("chatter")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeTab === "chatter" ? "bg-card text-brand-600 shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chatter ({comments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeTab === "activities" ? "bg-card text-brand-600 shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Activities ({activities.filter((a) => !a.isDone).length})</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeTab === "audit" ? "bg-card text-brand-600 shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History</span>
          </button>
        </div>

        <button
          onClick={() => setActivityModalOpen(true)}
          className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800 shadow-xs"
        >
          <Plus className="h-3 w-3" />
          <span>Schedule</span>
        </button>
      </div>

      {/* Main Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === "chatter" && (
          <>
            {/* Post Comment Input */}
            <form onSubmit={handlePostComment} className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2">
              <textarea
                rows={2}
                placeholder="Log a note or @mention team members..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full resize-none bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center justify-between border-t border-border/50 pt-2">
                <span className="text-[10px] text-muted-foreground">Use @ to mention colleagues</span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 shadow-xs"
                >
                  <Send className="h-3 w-3" />
                  <span>Log Note</span>
                </button>
              </div>
            </form>

            {/* Timeline Stream */}
            <div className="space-y-3 pt-2">
              {timelineEvents.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No conversation or audit activity yet. Be the first to leave a note!
                </div>
              ) : (
                timelineEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="flex gap-2.5 text-xs">
                    {evt.eventType === "comment" ? (
                      <>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800 text-[10px] font-bold">
                          {getInitials(`${evt.author?.firstName} ${evt.author?.lastName}`)}
                        </div>
                        <div className="flex-1 rounded-xl border border-border bg-card p-3 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">
                              {evt.author?.firstName} {evt.author?.lastName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatRelativeTime(evt.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-foreground leading-relaxed whitespace-pre-wrap">{evt.content}</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex w-full items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground border border-border/40">
                        <History className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="flex-1">
                          <strong className="text-foreground">{evt.user?.firstName || "System"}</strong> {evt.action === "stage_change" ? "changed stage" : evt.action === "create" ? "created record" : "updated record"}:{" "}
                          <span className="line-through text-slate-400">{evt.oldValue}</span> {evt.oldValue ? "→" : ""}{" "}
                          <strong className="text-brand-600">{evt.newValue}</strong>
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(evt.createdAt)}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "activities" && (
          <div className="space-y-2.5">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No activities scheduled for this record.
              </div>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className={`rounded-xl border p-3 text-xs transition-colors shadow-2xs ${
                    act.isDone ? "border-border bg-muted/30 opacity-60" : "border-indigo-100 bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      {act.activityType === "call" && <Phone className="h-3.5 w-3.5 text-blue-500" />}
                      {act.activityType === "meeting" && <Calendar className="h-3.5 w-3.5 text-purple-500" />}
                      {act.activityType === "email" && <Mail className="h-3.5 w-3.5 text-amber-500" />}
                      {act.activityType === "todo" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      <span className="capitalize">{act.activityType}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Due {formatDate(act.dueDate)}
                    </span>
                  </div>

                  <p className="mt-1.5 font-medium text-foreground">{act.summary}</p>
                  {act.notes && <p className="mt-1 text-[11px] text-muted-foreground">{act.notes}</p>}

                  <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2">
                    <span className="text-[10px] text-muted-foreground">
                      Assigned to: {act.assignedTo?.firstName || "Team"}
                    </span>
                    {!act.isDone ? (
                      <button
                        onClick={() => handleMarkDone(act.id)}
                        className="flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Mark Done</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600">✓ Completed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="rounded-lg border border-border bg-card p-2.5 text-xs">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{log.user?.firstName || "System"}</span>
                  <span>{formatDate(log.createdAt, "dd MMM yyyy, HH:mm")}</span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  Action: <span className="font-medium text-foreground capitalize">{log.action.replace("_", " ")}</span>
                  {log.fieldName && ` (${log.fieldName})`}
                </p>
                {log.newValue && (
                  <p className="mt-0.5 text-[11px] text-brand-600 font-mono bg-muted/40 p-1 rounded">
                    {log.oldValue ? `${log.oldValue} → ` : ""}{log.newValue}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Activity Modal */}
      <ScheduleActivityModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        recordType={recordType}
        recordId={recordId}
        recordTitle={recordTitle}
        onSuccess={fetchChatter}
      />
    </div>
  );
}
