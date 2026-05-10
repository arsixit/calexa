export type CalendarSystem = "gregorian" | "jalali" | "hijri";

export type EventColor = "violet" | "blue" | "cyan" | "green" | "amber" | "rose";

export type CalendarView = "month" | "week" | "day";

export type RecurrenceRule = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  allDay: boolean;
  color: EventColor;
  category?: string;
  recurrence: RecurrenceRule;
  createdAt: string;
}

export interface CalendarStore {
  events: CalendarEvent[];
  view: CalendarView;
  calendarSystem: CalendarSystem;
  currentDate: string; // ISO date string
  selectedDate: string | null;
  editingEvent: CalendarEvent | null;
  isEventDialogOpen: boolean;

  // actions
  addEvent: (event: Omit<CalendarEvent, "id" | "createdAt">) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setView: (view: CalendarView) => void;
  setCalendarSystem: (system: CalendarSystem) => void;
  navigateMonth: (direction: 1 | -1) => void;
  navigateToToday: () => void;
  setCurrentDate: (date: string) => void;
  setSelectedDate: (date: string | null) => void;
  openNewEventDialog: (date?: string) => void;
  openEditEventDialog: (event: CalendarEvent) => void;
  closeEventDialog: () => void;
  setEvents: (events: CalendarEvent[]) => void;
}

export const EVENT_COLORS: Record<EventColor, { bg: string; text: string; border: string; dot: string }> = {
  violet: {
    bg: "bg-violet-100 dark:bg-violet-500/20",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-500/30",
    dot: "bg-violet-500",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-500/30",
    dot: "bg-blue-500",
  },
  cyan: {
    bg: "bg-cyan-100 dark:bg-cyan-500/20",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-500/30",
    dot: "bg-cyan-500",
  },
  green: {
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-500/30",
    dot: "bg-amber-500",
  },
  rose: {
    bg: "bg-rose-100 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-500/30",
    dot: "bg-rose-500",
  },
};

export const CALENDAR_SYSTEM_LABELS: Record<CalendarSystem, string> = {
  gregorian: "Gregorian",
  jalali: "Jalali (Persian)",
  hijri: "Hijri (Islamic)",
};
