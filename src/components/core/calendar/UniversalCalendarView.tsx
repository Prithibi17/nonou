"use client";

import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string | Date;
  type?: string;
  color?: string;
}

interface UniversalCalendarViewProps {
  events: CalendarEventItem[];
  onEventClick?: (event: CalendarEventItem) => void;
}

export function UniversalCalendarView({ events, onEventClick }: UniversalCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/20">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-brand-600" />
          <h3 className="font-bold text-sm text-foreground">
            {format(currentDate, "MMMM yyyy")}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="rounded-lg border border-border p-1 text-muted-foreground hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="rounded-lg border border-border p-1 text-muted-foreground hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-[11px] font-bold text-muted-foreground py-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border text-xs">
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
          const isCurrMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[110px] p-2 transition-colors ${
                !isCurrMonth ? "bg-muted/20 text-muted-foreground/40" : "bg-card"
              } ${isDayToday ? "bg-brand-50/20" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                    isDayToday ? "bg-brand-600 text-white font-bold" : isCurrMonth ? "text-foreground" : "text-muted-foreground/50"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {dayEvents.length} items
                  </span>
                )}
              </div>

              {/* Event Pills */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick && onEventClick(event)}
                    className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium cursor-pointer transition-all hover:scale-[1.02] shadow-2xs"
                    style={{
                      backgroundColor: event.color ? `${event.color}15` : "#eef2ff",
                      color: event.color || "#4f46e5",
                      borderLeft: `2.5px solid ${event.color || "#6366f1"}`,
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground font-bold">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
