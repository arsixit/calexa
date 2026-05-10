import { createClient } from "./client";
import type { CalendarEvent } from "@/lib/types";

function toDbRow(event: CalendarEvent, userId: string) {
  return {
    id: event.id,
    user_id: userId,
    title: event.title,
    description: event.description ?? null,
    date: event.date,
    start_time: event.startTime ?? null,
    end_time: event.endTime ?? null,
    all_day: event.allDay,
    color: event.color,
    category: event.category ?? null,
    recurrence: event.recurrence,
    created_at: event.createdAt,
  };
}

function fromDbRow(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    date: row.date as string,
    startTime: (row.start_time as string) ?? undefined,
    endTime: (row.end_time as string) ?? undefined,
    allDay: row.all_day as boolean,
    color: row.color as CalendarEvent["color"],
    category: (row.category as string) ?? undefined,
    recurrence: row.recurrence as CalendarEvent["recurrence"],
    createdAt: row.created_at as string,
  };
}

export async function fetchEvents(): Promise<CalendarEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(fromDbRow);
}

export async function upsertEvent(event: CalendarEvent, userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("events")
    .upsert(toDbRow(event, userId), { onConflict: "id" });
  if (error) throw error;
}

export async function removeEvent(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function syncLocalToCloud(events: CalendarEvent[], userId: string): Promise<void> {
  const supabase = createClient();
  if (events.length === 0) return;
  const rows = events.map((e) => toDbRow(e, userId));
  const { error } = await supabase.from("events").upsert(rows, { onConflict: "id" });
  if (error) throw error;
}
