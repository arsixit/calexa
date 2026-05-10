"use client";

import { motion } from "framer-motion";
import { format, parseISO, isToday } from "date-fns";
import { useCalendarStore } from "@/lib/store";
import { getDayLabel, HOURS, formatHour } from "@/lib/calendar-engine";
import { EVENT_COLORS, type CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const HOUR_HEIGHT = 64;

function EventBlock({ event }: { event: CalendarEvent }) {
  const { openEditEventDialog } = useCalendarStore();
  const colors = EVENT_COLORS[event.color];

  const startHour = event.startTime ? parseInt(event.startTime.split(":")[0]) : 8;
  const startMin = event.startTime ? parseInt(event.startTime.split(":")[1]) : 0;
  const endHour = event.endTime ? parseInt(event.endTime.split(":")[0]) : startHour + 1;
  const endMin = event.endTime ? parseInt(event.endTime.split(":")[1]) : startMin;

  const top = (startHour + startMin / 60) * HOUR_HEIGHT;
  const height = Math.max(((endHour - startHour) + (endMin - startMin) / 60) * HOUR_HEIGHT, 28);

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => openEditEventDialog(event)}
      style={{ top, height }}
      className={cn(
        "absolute left-1 right-1 rounded-xl px-3 py-1.5 text-left border overflow-hidden hover:shadow-md transition-all",
        colors.bg,
        colors.text,
        colors.border
      )}
    >
      <p className="text-xs font-semibold">{event.title}</p>
      {event.startTime && (
        <p className="text-[10px] opacity-70 mt-0.5">
          {event.startTime}{event.endTime && ` – ${event.endTime}`}
        </p>
      )}
      {event.description && height > 50 && (
        <p className="text-[10px] opacity-60 mt-1 truncate">{event.description}</p>
      )}
    </motion.button>
  );
}

export function DayView() {
  const { currentDate, calendarSystem, events, openNewEventDialog } = useCalendarStore();
  const date = parseISO(currentDate);
  const isTodayDate = isToday(date);

  const dayEvents = events.filter((e) => e.date === currentDate && !e.allDay);
  const allDayEvents = events.filter((e) => e.date === currentDate && e.allDay);

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day header */}
      <div className={cn("border-b border-border/50 py-4 px-6 shrink-0", isTodayDate && "bg-primary/5")}>
        <div className="flex items-baseline gap-3">
          <div
            className={cn(
              "h-12 w-12 flex items-center justify-center rounded-2xl text-2xl font-bold",
              isTodayDate ? "gradient-brand text-white shadow-lg shadow-primary/30" : "bg-muted text-foreground"
            )}
          >
            {getDayLabel(date, calendarSystem)}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{format(date, "EEEE")}</p>
            <p className="text-sm text-muted-foreground">{format(date, "MMMM yyyy")}</p>
          </div>
        </div>

        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {allDayEvents.map((event) => {
              const colors = EVENT_COLORS[event.color];
              return (
                <div
                  key={event.id}
                  className={cn("rounded-lg px-2.5 py-1 text-xs font-medium border", colors.bg, colors.text, colors.border)}
                >
                  {event.title}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex" style={{ height: HOUR_HEIGHT * 24 }}>
          {/* Hours */}
          <div className="w-20 shrink-0 relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-3 text-[10px] text-muted-foreground"
                style={{ top: hour * HOUR_HEIGHT - 7 }}
              >
                {hour === 0 ? "" : formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Events column */}
          <div
            className="flex-1 relative border-l border-border/30 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const y = e.clientY - rect.top;
              const hour = Math.floor(y / HOUR_HEIGHT);
              const min = Math.round(((y % HOUR_HEIGHT) / HOUR_HEIGHT) * 60 / 15) * 15;
              openNewEventDialog(currentDate);
            }}
          >
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-t border-border/20 absolute w-full"
                style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              >
                <div
                  className="border-t border-border/10 absolute w-full"
                  style={{ top: HOUR_HEIGHT / 2 }}
                />
              </div>
            ))}

            {/* Current time indicator */}
            {isTodayDate && (
              <div
                className="absolute left-0 right-0 flex items-center z-10 pointer-events-none"
                style={{ top: currentHour * HOUR_HEIGHT }}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-primary -ml-1.5 shrink-0 shadow-sm shadow-primary/50" />
                <div className="flex-1 h-px bg-primary" />
              </div>
            )}

            {dayEvents.map((event) => (
              <EventBlock key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
