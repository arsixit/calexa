"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { useCalendarStore } from "@/lib/store";
import { buildMonthGrid, getDayLabel, WEEK_DAYS } from "@/lib/calendar-engine";
import { EVENT_COLORS, type CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

function EventChip({
  event,
  onClick,
  isDragging = false,
}: {
  event: CalendarEvent;
  onClick: () => void;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: event.id });
  const colors = EVENT_COLORS[event.color];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={transform ? { transform: `translate(${transform.x}px,${transform.y}px)`, zIndex: 50 } : undefined}
      className={cn("touch-none", isDragging && "opacity-50")}
    >
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
        {event.startTime && <span className="opacity-70 mr-1">{event.startTime}</span>}
        {event.title}
      </button>
    </div>
  );
}

function DroppableDay({
  dateStr,
  children,
  isCurrentMonth,
  isToday,
  isWeekend,
  dayLabel,
  onDayClick,
  hasEvents,
}: {
  dateStr: string;
  children: React.ReactNode;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  dayLabel: string;
  onDayClick: () => void;
  hasEvents: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-r border-border/50 last:border-r-0 p-1.5 flex flex-col gap-0.5 cursor-pointer group min-h-0 overflow-hidden transition-colors",
        !isCurrentMonth && "bg-muted/20",
        isToday && "bg-primary/5",
        isWeekend && isCurrentMonth && "bg-muted/10",
        isOver && "bg-primary/10 ring-1 ring-inset ring-primary/30"
      )}
      onClick={onDayClick}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span
          className={cn(
            "h-6 w-6 flex items-center justify-center rounded-full text-xs font-semibold transition-colors",
            isToday
              ? "bg-primary text-primary-foreground"
              : isCurrentMonth
              ? "text-foreground group-hover:bg-accent"
              : "text-muted-foreground/40"
          )}
        >
          {dayLabel}
        </span>
        {!hasEvents && (
          <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      {children}
    </div>
  );
}

export function MonthView() {
  const {
    currentDate,
    calendarSystem,
    events,
    openNewEventDialog,
    openEditEventDialog,
    updateEvent,
    setCurrentDate,
    setView,
  } = useCalendarStore();

  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const referenceDate = parseISO(currentDate);
  const weeks = buildMonthGrid(referenceDate);

  const getEventsForDay = (dateStr: string) =>
    events
      .filter((e) => e.date === dateStr)
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  const handleDragStart = (e: DragStartEvent) => {
    const event = events.find((ev) => ev.id === e.active.id);
    if (event) setActiveEvent(event);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const targetDate = over.id as string;
      // Validate it looks like a date string
      if (/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
        updateEvent(active.id as string, { date: targetDate });
      }
    }
    setActiveEvent(null);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                  <DroppableDay
                    key={day.dateStr}
                    dateStr={day.dateStr}
                    isCurrentMonth={day.isCurrentMonth}
                    isToday={day.isToday}
                    isWeekend={day.isWeekend}
                    dayLabel={getDayLabel(day.date, calendarSystem)}
                    hasEvents={dayEvents.length > 0}
                    onDayClick={() => {
                      setCurrentDate(day.dateStr);
                      openNewEventDialog(day.dateStr);
                    }}
                  >
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      {dayEvents.slice(0, maxVisible).map((event) => (
                        <EventChip
                          key={event.id}
                          event={event}
                          isDragging={activeEvent?.id === event.id}
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
                  </DroppableDay>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeEvent && (
          <div
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-medium border shadow-lg opacity-90 w-24 truncate",
              EVENT_COLORS[activeEvent.color].bg,
              EVENT_COLORS[activeEvent.color].text,
              EVENT_COLORS[activeEvent.color].border
            )}
          >
            {activeEvent.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
