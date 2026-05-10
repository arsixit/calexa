"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, isToday, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCalendarStore } from "@/lib/store";
import { formatMonthYear, getDayLabel, WEEK_DAYS } from "@/lib/calendar-engine";
import { EVENT_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function MiniCalendar() {
  const { currentDate, calendarSystem, events, setCurrentDate, openNewEventDialog } = useCalendarStore();
  const [miniDate, setMiniDate] = useState(() => parseISO(currentDate));

  const handleDayClick = (dateStr: string) => {
    setCurrentDate(dateStr);
  };

  const monthStart = startOfMonth(miniDate);
  const monthEnd = endOfMonth(miniDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const selectedDate = parseISO(currentDate);

  return (
    <div className="p-3">
      {/* Mini month header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-foreground">
          {format(miniDate, "MMM yyyy")}
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={() => setMiniDate(subMonths(miniDate, 1))}
            className="h-5 w-5 rounded flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button
            onClick={() => setMiniDate(addMonths(miniDate, 1))}
            className="h-5 w-5 rounded flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-[9px] font-medium text-muted-foreground py-0.5">
            {d[0]}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isSelected = isSameDay(day, selectedDate);
          const isThisMonth = isSameMonth(day, miniDate);
          const isTodayDate = isToday(day);
          const hasEvents = events.some((e) => e.date === dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              className={cn(
                "h-6 w-6 mx-auto flex items-center justify-center rounded-full text-[10px] font-medium transition-all relative",
                isSelected && "bg-primary text-primary-foreground",
                !isSelected && isTodayDate && "text-primary font-bold",
                !isSelected && !isTodayDate && isThisMonth && "text-foreground hover:bg-accent",
                !isSelected && !isThisMonth && "text-muted-foreground/40 hover:bg-accent/50"
              )}
            >
              {getDayLabel(day, calendarSystem)}
              {hasEvents && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UpcomingEvents() {
  const { events, openEditEventDialog } = useCalendarStore();
  const today = format(new Date(), "yyyy-MM-dd");

  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  if (upcoming.length === 0) {
    return (
      <div className="px-3 py-4 text-center">
        <p className="text-[11px] text-muted-foreground">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="px-3 space-y-1.5">
      {upcoming.map((event) => {
        const colors = EVENT_COLORS[event.color];
        return (
          <button
            key={event.id}
            onClick={() => openEditEventDialog(event)}
            className={cn(
              "w-full text-left flex items-start gap-2 p-2 rounded-lg transition-colors hover:bg-accent/50",
            )}
          >
            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", colors.dot)} />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">{event.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {format(parseISO(event.date), "MMM d")}
                {event.startTime && ` · ${event.startTime}`}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const { openNewEventDialog } = useCalendarStore();

  return (
    <aside className="w-56 shrink-0 border-r border-border/50 flex flex-col bg-sidebar/50 overflow-y-auto scrollbar-hide">
      <div className="p-3 pt-4">
        <Button
          size="sm"
          className="w-full h-8 gap-1.5 rounded-xl gradient-brand text-white border-0 shadow-md shadow-primary/20 hover:opacity-90 transition-all text-xs"
          onClick={() => openNewEventDialog()}
        >
          <Plus className="h-3.5 w-3.5" />
          New Event
        </Button>
      </div>

      <MiniCalendar />

      <div className="mx-3 h-px bg-border/50 my-2" />

      <div className="px-3 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Upcoming
        </p>
      </div>

      <UpcomingEvents />
    </aside>
  );
}
