"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/core/shell/AppShell";
import {
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
} from "@/components/core/kanban/KanbanBoard";
import {
  FolderKanban,
  Plus,
  CheckSquare,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Building2,
  X,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProjectItem, TaskItem } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // New Task Form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskEstimatedHours, setTaskEstimatedHours] = useState(8);
  const [taskAssignedToId, setTaskAssignedToId] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
      setTasks(data.tasks || []);
      setUsers(data.users || []);
      if (data.projects?.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data.projects[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleTaskStageMoved = async (taskId: string, newStageId: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, stageId: newStageId } : t))
    );

    try {
      await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, stageId: newStageId }),
      });
    } catch (e) {
      console.error(e);
      fetchProjects();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "task",
          projectId: activeProject.id,
          stageId: activeProject.stages[0]?.id,
          title: taskTitle,
          priority: taskPriority,
          estimatedHours: taskEstimatedHours,
          assignedToId: taskAssignedToId || null,
        }),
      });
      setTaskTitle("");
      setTaskModalOpen(false);
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const projectTasks = tasks.filter((t) => t.projectId === activeProject?.id);

  const kanbanColumns: KanbanColumn[] = (activeProject?.stages || []).map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
  }));

  const kanbanItems: KanbanItem[] = projectTasks.map((t) => ({
    id: t.id,
    columnId: t.stageId,
    title: t.title,
    subtitle: `${t.estimatedHours} Estimated Hours`,
    priority: t.priority,
    tags: t.tags,
    assignedTo: t.assignedTo,
  }));

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 border border-purple-200">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{activeProject?.name || "Projects & Tasks"}</h1>
                {activeProject && (
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">
                    {activeProject.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Customer: <strong className="text-foreground">{activeProject?.customer?.name || "Internal"}</strong> • Budget:{" "}
                <strong className="text-foreground">{formatCurrency(activeProject?.budget || 0)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Project Switcher */}
            {projects.length > 1 && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-brand-600"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setTaskModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Task Kanban Board */}
        {activeProject && (
          <KanbanBoard
            columns={kanbanColumns}
            items={kanbanItems}
            onItemMoved={handleTaskStageMoved}
            onItemClick={(item) => {
              const task = tasks.find((t) => t.id === item.id);
              if (task) setSelectedTask(task);
            }}
            onQuickAdd={() => setTaskModalOpen(true)}
          />
        )}

        {/* New Task Modal */}
        {taskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white">
                    <CheckSquare className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Create New Task</h3>
                </div>
                <button onClick={() => setTaskModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Set up GST invoice automated dispatch webhook"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      value={taskEstimatedHours}
                      onChange={(e) => setTaskEstimatedHours(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Assignee</label>
                  <select
                    value={taskAssignedToId}
                    onChange={(e) => setTaskAssignedToId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setTaskModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
