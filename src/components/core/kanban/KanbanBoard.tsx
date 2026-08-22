"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, MoreVertical, Building2, User, Clock, AlertCircle } from "lucide-react";
import { formatCompactNumber, getInitials } from "@/lib/utils";
import confetti from "canvas-confetti";

export interface KanbanColumn {
  id: string;
  name: string;
  color?: string;
  probability?: number;
  isWon?: boolean;
}

export interface KanbanItem {
  id: string;
  columnId: string;
  title: string;
  subtitle?: string | null;
  value?: number;
  priority?: string;
  tags?: string | null;
  assignedTo?: { firstName: string; lastName: string; avatarUrl?: string | null } | null;
  dueDate?: string | null;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onItemMoved: (itemId: string, targetColumnId: string) => void;
  onItemClick?: (item: KanbanItem) => void;
  onQuickAdd?: (columnId: string) => void;
}

export function KanbanBoard({
  columns,
  items,
  onItemMoved,
  onItemClick,
  onQuickAdd,
}: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const item = items.find((i) => i.id === event.active.id);
    if (item) setActiveItem(item);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Over could be a column id OR another item id
    let targetColumnId = overId;
    const overItem = items.find((i) => i.id === overId);
    if (overItem) {
      targetColumnId = overItem.columnId;
    }

    const currentItem = items.find((i) => i.id === activeId);
    if (currentItem && currentItem.columnId !== targetColumnId) {
      onItemMoved(activeId, targetColumnId);

      // Trigger celebratory confetti if moved to a "Won" column!
      const targetCol = columns.find((c) => c.id === targetColumnId);
      if (targetCol?.isWon || targetCol?.name.toLowerCase() === "won") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[calc(100vh-220px)]">
        {columns.map((column) => {
          const columnItems = items.filter((item) => item.columnId === column.id);
          const totalValue = columnItems.reduce((acc, curr) => acc + (curr.value || 0), 0);

          return (
            <KanbanColumnDroppable
              key={column.id}
              column={column}
              items={columnItems}
              totalValue={totalValue}
              onItemClick={onItemClick}
              onQuickAdd={onQuickAdd}
            />
          );
        })}
      </div>

      {/* Drag Overlay Preview */}
      <DragOverlay>
        {activeItem ? <KanbanCardItem item={activeItem} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumnDroppable({
  column,
  items,
  totalValue,
  onItemClick,
  onQuickAdd,
}: {
  column: KanbanColumn;
  items: KanbanItem[];
  totalValue: number;
  onItemClick?: (item: KanbanItem) => void;
  onQuickAdd?: (columnId: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className="flex w-80 shrink-0 flex-col rounded-2xl border border-border bg-card/60 p-3 shadow-xs backdrop-blur-xs"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full shadow-xs"
            style={{ backgroundColor: column.color || "#6366f1" }}
          />
          <span className="font-bold text-xs text-foreground">{column.name}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">
            {items.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {totalValue > 0 && (
            <span className="text-[11px] font-bold text-brand-600">
              {formatCompactNumber(totalValue)}
            </span>
          )}
          {onQuickAdd && (
            <button
              onClick={() => onQuickAdd(column.id)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Column Cards */}
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[140px]">
          {items.map((item) => (
            <SortableKanbanCard key={item.id} item={item} onItemClick={onItemClick} />
          ))}
          {items.length === 0 && (
            <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border text-[11px] text-muted-foreground">
              Drop deals here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableKanbanCard({
  item,
  onItemClick,
}: {
  item: KanbanItem;
  onItemClick?: (item: KanbanItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCardItem item={item} onClick={() => onItemClick && onItemClick(item)} />
    </div>
  );
}

function KanbanCardItem({
  item,
  isOverlay = false,
  onClick,
}: {
  item: KanbanItem;
  isOverlay?: boolean;
  onClick?: () => void;
}) {
  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "Urgent":
        return <span className="rounded bg-red-100 px-1.5 py-0.2 text-[9px] font-bold text-red-800">Urgent</span>;
      case "High":
        return <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">High</span>;
      case "Low":
        return <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-medium text-slate-700">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl border border-border bg-card p-3 shadow-xs hover:border-brand-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        isOverlay ? "scale-105 rotate-1 ring-2 ring-brand-500 shadow-xl" : ""
      }`}
    >
      {/* Title & Priority */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-xs text-foreground line-clamp-2 leading-snug">
          {item.title}
        </h4>
        {getPriorityBadge(item.priority)}
      </div>

      {/* Subtitle / Company */}
      {item.subtitle && (
        <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground truncate">
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{item.subtitle}</span>
        </div>
      )}

      {/* Tags */}
      {item.tags && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.split(",").slice(0, 2).map((t, idx) => (
            <span
              key={idx}
              className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-medium text-muted-foreground"
            >
              {t.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Row: Value & Assignee */}
      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-xs">
        <div>
          {item.value !== undefined && (
            <span className="font-bold text-foreground">
              {formatCompactNumber(item.value)}
            </span>
          )}
        </div>

        {item.assignedTo && (
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-white shadow-xs"
            title={`${item.assignedTo.firstName} ${item.assignedTo.lastName}`}
          >
            {getInitials(`${item.assignedTo.firstName} ${item.assignedTo.lastName}`)}
          </div>
        )}
      </div>
    </div>
  );
}
