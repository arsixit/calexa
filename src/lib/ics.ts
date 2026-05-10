import type { CalendarEvent } from "./types";

function formatICSDate(dateStr: string, timeStr?: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  if (!timeStr) return `${y}${m}${d}`;

  const [h, min] = timeStr.split(":");
  return `${y}${m}${d}T${h.padStart(2, "0")}${min.padStart(2, "0")}00`;
}

function escapeICS(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function exportToICS(events: CalendarEvent[]): void {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calexa//Professional Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Calexa Calendar",
    "X-WR-TIMEZONE:UTC",
  ];

  for (const event of events) {
    const uid = `${event.id}@calexa.app`;
    const created = new Date(event.createdAt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${created}`);
    lines.push(`CREATED:${created}`);
    lines.push(`SUMMARY:${escapeICS(event.title)}`);

    if (event.allDay || !event.startTime) {
      lines.push(`DTSTART;VALUE=DATE:${formatICSDate(event.date)}`);
      // Add one day for DTEND in all-day events (exclusive)
      const end = new Date(event.date);
      end.setDate(end.getDate() + 1);
      const endStr = end.toISOString().slice(0, 10);
      lines.push(`DTEND;VALUE=DATE:${formatICSDate(endStr)}`);
    } else {
      lines.push(`DTSTART:${formatICSDate(event.date, event.startTime)}`);
      lines.push(`DTEND:${formatICSDate(event.date, event.endTime || event.startTime)}`);
    }

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    }

    if (event.recurrence !== "none") {
      const freq: Record<string, string> = {
        daily: "DAILY",
        weekly: "WEEKLY",
        monthly: "MONTHLY",
        yearly: "YEARLY",
      };
      lines.push(`RRULE:FREQ=${freq[event.recurrence]}`);
    }

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  const content = lines.join("\r\n");
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "calexa-events.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseICS(content: string): Omit<CalendarEvent, "id" | "createdAt">[] {
  const events: Omit<CalendarEvent, "id" | "createdAt">[] = [];
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  let inEvent = false;
  let current: Partial<Omit<CalendarEvent, "id" | "createdAt">> = {};

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current = { color: "violet", recurrence: "none", allDay: false };
      continue;
    }

    if (line === "END:VEVENT" && inEvent) {
      if (current.title && current.date) {
        events.push(current as Omit<CalendarEvent, "id" | "createdAt">);
      }
      inEvent = false;
      current = {};
      continue;
    }

    if (!inEvent) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).toUpperCase();
    const val = line.slice(colonIdx + 1);

    if (key === "SUMMARY") {
      current.title = val.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";");
    } else if (key === "DESCRIPTION") {
      current.description = val.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";");
    } else if (key.startsWith("DTSTART")) {
      if (key.includes("VALUE=DATE")) {
        // All-day
        const y = val.slice(0, 4), m = val.slice(4, 6), d = val.slice(6, 8);
        current.date = `${y}-${m}-${d}`;
        current.allDay = true;
      } else {
        const y = val.slice(0, 4), m = val.slice(4, 6), d = val.slice(6, 8);
        const h = val.slice(9, 11), min = val.slice(11, 13);
        current.date = `${y}-${m}-${d}`;
        current.startTime = `${h}:${min}`;
        current.allDay = false;
      }
    } else if (key.startsWith("DTEND")) {
      if (!key.includes("VALUE=DATE") && val.length > 8) {
        const h = val.slice(9, 11), min = val.slice(11, 13);
        current.endTime = `${h}:${min}`;
      }
    } else if (key === "RRULE") {
      if (val.includes("DAILY")) current.recurrence = "daily";
      else if (val.includes("WEEKLY")) current.recurrence = "weekly";
      else if (val.includes("MONTHLY")) current.recurrence = "monthly";
      else if (val.includes("YEARLY")) current.recurrence = "yearly";
    }
  }

  return events;
}
