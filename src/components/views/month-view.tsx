"use client";

import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, isToday, isSameDay } from "date-fns";
import { Plus } from "lucide-react";
import { useCalendarStore } from "@/lib/store";
import { buildMonthGrid, getDayLabel, WEEK_DAYS } from "@/lib/calendar-engine";
import { EVENT_COLORS, type CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

function EventChip({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const colors = EVENT_COLORS[event.color];
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "w-full text-left truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium border transition-all hover:brightness-95 active:scale-95",
        colors.bg,
        colors.text,
        colors.border
      )}
    >
      {event.startTime && (
        <span className="opacity-70 mr-1">{event.startTime}</span>
      )}
      {event.title}
    </button>
  );
}

export function MonthView() {
  const {
    currentDate,
    calendarSystem,
    events,
    openNewEventDialog,
    openEditEventDialog,
    setCurrentDate,
    setView,
  } = useCalendarStore();

  const referenceDate = parseISO(currentDate);
  const weeks = buildMonthGrid(referenceDate);

  const getEventsForDay = (dateStr: string) =>
    events
      .filter((e) => e.date === dateStr)
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border/50">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-rows-6 overflow-hidden">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border/50 last:border-b-0 min-h-0">
            {week.map((day) => {
              const dayEvents = getEventsForDay(day.dateStr);
              const maxVisible = 3;
              const overflow = dayEvents.length - maxVisible;

              return (
                <motion.div
                  key={day.dateStr}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "border-r border-border/50 last:border-r-0 p-1.5 flex flex-col gap-0.5 cursor-pointer group min-h-0 overflow-hidden",
                    !day.isCurrentMonth && "bg-muted/20",
                    day.isToday && "bg-primary/5",
                    day.isWeekend && day.isCurrentMonth && "bg-muted/10"
                  )}
                  onClick={() => {
                    setCurrentDate(day.dateStr);
                    openNewEventDialog(day.dateStr);
                  }}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={cn(
                        "h-6 w-6 flex items-center justify-center rounded-full text-xs font-semibold transition-colors",
                        day.isToday
                          ? "bg-primary text-primary-foreground"
                          : day.isCurrentMonth
                          ? "text-foreground group-hover:bg-accent"
                          : "text-muted-foreground/40"
                      )}
                    >
                      {getDayLabel(day.date, calendarSystem)}
                    </span>

                    {dayEvents.length === 0 && (
                      <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {/* Events */}
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayEvents.slice(0, maxVisible).map((event) => (
                      <EventChip
                        key={event.id}
                        event={event}
                        onClick={() => openEditEventDialog(event)}
                      />
                    ))}
                    {overflow > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentDate(day.dateStr);
                          setView("day");
                        }}
                        className="text-[10px] text-primary font-medium hover:underline text-left px-1"
                      >
                        +{overflow} more
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
