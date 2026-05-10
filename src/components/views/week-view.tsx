"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { format, parseISO, isToday } from "date-fns";
import { useCalendarStore } from "@/lib/store";
import { buildWeekGrid, getDayLabel, HOURS, formatHour, WEEK_DAYS } from "@/lib/calendar-engine";
import { EVENT_COLORS, type CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const HOUR_HEIGHT = 60; // px per hour

function EventBlock({ event }: { event: CalendarEvent }) {
  const { openEditEventDialog } = useCalendarStore();
  const colors = EVENT_COLORS[event.color];

  const startHour = event.startTime ? parseInt(event.startTime.split(":")[0]) : 0;
  const startMin = event.startTime ? parseInt(event.startTime.split(":")[1]) : 0;
  const endHour = event.endTime ? parseInt(event.endTime.split(":")[0]) : startHour + 1;
  const endMin = event.endTime ? parseInt(event.endTime.split(":")[1]) : startMin;

  const top = (startHour + startMin / 60) * HOUR_HEIGHT;
  const height = Math.max(((endHour - startHour) + (endMin - startMin) / 60) * HOUR_HEIGHT, 20);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => openEditEventDialog(event)}
      style={{ top, height }}
      className={cn(
        "absolute left-0.5 right-0.5 rounded-lg px-2 py-1 text-left border overflow-hidden transition-all hover:brightness-95 hover:shadow-sm",
        colors.bg,
        colors.text,
        colors.border
      )}
    >
      <p className="text-[10px] font-semibold truncate">{event.title}</p>
      {height > 30 && event.startTime && (
        <p className="text-[9px] opacity-70">{event.startTime}{event.endTime && ` – ${event.endTime}`}</p>
      )}
    </motion.button>
  );
}

export function WeekView() {
  const { currentDate, calendarSystem, events, openNewEventDialog, setCurrentDate, setView } = useCalendarStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const weekDays = buildWeekGrid(parseISO(currentDate));

  const getEventsForDay = (dateStr: string) =>
    events.filter((e) => e.date === dateStr && !e.allDay && e.startTime);

  const getAllDayEventsForDay = (dateStr: string) =>
    events.filter((e) => e.date === dateStr && e.allDay);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b border-border/50 shrink-0">
        <div className="w-16 shrink-0" />
        {weekDays.map((day) => (
          <div
            key={day.dateStr}
            className={cn(
              "py-3 text-center cursor-pointer hover:bg-accent/50 transition-colors",
              day.isToday && "bg-primary/5"
            )}
            onClick={() => {
              setCurrentDate(day.dateStr);
              setView("day");
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {WEEK_DAYS[new Date(day.dateStr).getDay()]}
            </p>
            <div
              className={cn(
                "mx-auto mt-1 h-8 w-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors",
                day.isToday
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              )}
            >
              {getDayLabel(day.date, calendarSystem)}
            </div>
          </div>
        ))}
      </div>

      {/* All-day row */}
      {weekDays.some((d) => getAllDayEventsForDay(d.dateStr).length > 0) && (
        <div className="grid grid-cols-8 border-b border-border/50 shrink-0 min-h-8">
          <div className="w-16 px-2 py-1 text-[9px] text-muted-foreground text-right">all-day</div>
          {weekDays.map((day) => (
            <div key={day.dateStr} className="border-l border-border/30 px-0.5 py-0.5 flex flex-col gap-0.5">
              {getAllDayEventsForDay(day.dateStr).map((event) => {
                const colors = EVENT_COLORS[event.color];
                return (
                  <div
                    key={event.id}
                    className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium truncate", colors.bg, colors.text)}
                  >
                    {event.title}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-8" style={{ height: HOUR_HEIGHT * 24 }}>
          {/* Hours column */}
          <div className="w-16 relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 text-[9px] text-muted-foreground"
                style={{ top: hour * HOUR_HEIGHT - 6 }}
              >
                {hour === 0 ? "" : formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => (
            <div
              key={day.dateStr}
              className={cn(
                "border-l border-border/30 relative cursor-pointer",
                day.isToday && "bg-primary/3"
              )}
              onClick={() => openNewEventDialog(day.dateStr)}
            >
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="border-t border-border/20 absolute w-full"
                  style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                />
              ))}
              {getEventsForDay(day.dateStr).map((event) => (
                <EventBlock key={event.id} event={event} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
