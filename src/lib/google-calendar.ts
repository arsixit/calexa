import type { CalendarEvent } from "./types";

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

function toCalendarEvent(item: any): CalendarEvent {
  const isAllDay = Boolean(item.start?.date && item.end?.date);
  const startDate = item.start?.dateTime ? new Date(item.start.dateTime) : new Date(item.start?.date || Date.now());
  const endDate = item.end?.dateTime ? new Date(item.end.dateTime) : new Date(item.end?.date || Date.now());
  const date = startDate.toISOString().slice(0, 10);

  return {
    id: item.id || `${date}-${Math.random().toString(36).slice(2)}`,
    title: item.summary || "Untitled event",
    description: item.description ?? undefined,
    date,
    startTime: isAllDay ? undefined : formatTime(startDate),
    endTime: isAllDay ? undefined : formatTime(endDate),
    allDay: isAllDay,
    color: "blue",
    category: item.location ?? undefined,
    recurrence: item.recurrence ? "weekly" : "none",
    createdAt: item.created ?? new Date().toISOString(),
    updatedAt: item.updated ?? new Date().toISOString(),
  };
}

export async function fetchGoogleCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("timeMin", new Date().toISOString());
  url.searchParams.set("maxResults", "100");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Unable to fetch Google Calendar events.");
  }

  return (data.items ?? []).map(toCalendarEvent);
}
