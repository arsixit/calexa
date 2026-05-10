import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
  parseISO,
  getDay,
} from "date-fns";
import type { CalendarSystem } from "./types";

export interface CalendarDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  displayDay: string;
  displayMonth?: string;
}

export interface CalendarMonth {
  year: number;
  month: number; // 1-based
  label: string;
  weeks: CalendarDay[][];
}

// Hijri conversion (simplified approximation)
function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const jd = Math.floor(
    (14 + Math.floor(12 * ((date.getMonth() + 1 - 1.5) / 12) + date.getFullYear()) / 12)
  );
  // Use Intl API for accuracy
  const hijri = new Intl.DateTimeFormat("en-u-ca-islamic", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const year = parseInt(hijri.find((p) => p.type === "year")?.value || "0");
  const month = parseInt(hijri.find((p) => p.type === "month")?.value || "0");
  const day = parseInt(hijri.find((p) => p.type === "day")?.value || "0");
  return { year, month, day };
}

// Jalali conversion using date-fns-jalali
let jalaliFormat: ((date: Date, fmt: string) => string) | null = null;

async function loadJalali() {
  if (!jalaliFormat) {
    try {
      const mod = await import("date-fns-jalali");
      jalaliFormat = mod.format;
    } catch {
      jalaliFormat = null;
    }
  }
  return jalaliFormat;
}

export function getDisplayDate(date: Date, system: CalendarSystem): string {
  if (system === "gregorian") return format(date, "d");
  if (system === "hijri") {
    const { day } = gregorianToHijri(date);
    return String(day);
  }
  // jalali - fallback to gregorian for SSR, client will hydrate
  return format(date, "d");
}

export function getJalaliDay(date: Date): string {
  try {
    // Use Intl API as fallback
    const persian = new Intl.DateTimeFormat("fa-IR-u-nu-latn", { day: "numeric" }).format(date);
    return persian;
  } catch {
    return format(date, "d");
  }
}

export function getHijriDay(date: Date): string {
  try {
    return String(gregorianToHijri(date).day);
  } catch {
    return format(date, "d");
  }
}

export function formatMonthYear(date: Date, system: CalendarSystem): string {
  if (system === "gregorian") {
    return format(date, "MMMM yyyy");
  }
  if (system === "jalali") {
    try {
      const month = new Intl.DateTimeFormat("fa-IR-u-nu-latn", { month: "long" }).format(date);
      const year = new Intl.DateTimeFormat("fa-IR-u-nu-latn", { year: "numeric" }).format(date);
      return `${month} ${year}`;
    } catch {
      return format(date, "MMMM yyyy");
    }
  }
  if (system === "hijri") {
    try {
      const month = new Intl.DateTimeFormat("en-u-ca-islamic", { month: "long" }).format(date);
      const { year } = gregorianToHijri(date);
      return `${month} ${year} AH`;
    } catch {
      return format(date, "MMMM yyyy");
    }
  }
  return format(date, "MMMM yyyy");
}

export function getDayLabel(date: Date, system: CalendarSystem): string {
  if (system === "gregorian") return format(date, "d");
  if (system === "jalali") return getJalaliDay(date);
  if (system === "hijri") return getHijriDay(date);
  return format(date, "d");
}

export function buildMonthGrid(referenceDate: Date): CalendarDay[][] {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weeks: CalendarDay[][] = [];
  let week: CalendarDay[] = [];

  days.forEach((day, i) => {
    const dow = getDay(day);
    week.push({
      date: day,
      dateStr: format(day, "yyyy-MM-dd"),
      isCurrentMonth: isSameMonth(day, referenceDate),
      isToday: isToday(day),
      isWeekend: dow === 0 || dow === 6,
      displayDay: format(day, "d"),
    });

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });

  if (week.length > 0) weeks.push(week);
  return weeks;
}

export function buildWeekGrid(referenceDate: Date): CalendarDay[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd }).map((day) => ({
    date: day,
    dateStr: format(day, "yyyy-MM-dd"),
    isCurrentMonth: isSameMonth(day, referenceDate),
    isToday: isToday(day),
    isWeekend: getDay(day) === 0 || getDay(day) === 6,
    displayDay: format(day, "d"),
  }));
}

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}
