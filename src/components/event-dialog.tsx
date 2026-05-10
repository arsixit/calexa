"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2, Clock, AlignLeft, Repeat, Tag } from "lucide-react";
import { useCalendarStore } from "@/lib/store";
import { EVENT_COLORS, CALENDAR_SYSTEM_LABELS, type EventColor, type RecurrenceRule, type CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const COLORS: EventColor[] = ["violet", "blue", "cyan", "green", "amber", "rose"];
const PRESET_CATEGORIES = ["Work", "Personal", "Health", "Social", "Travel"];
const RECURRENCE_OPTIONS: { value: RecurrenceRule; label: string }[] = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const DEFAULT_FORM = {
  title: "",
  description: "",
  date: format(new Date(), "yyyy-MM-dd"),
  startTime: "09:00",
  endTime: "10:00",
  allDay: false,
  color: "violet" as EventColor,
  recurrence: "none" as RecurrenceRule,
  category: "",
};

export function EventDialog() {
  const { isEventDialogOpen, editingEvent, selectedDate, closeEventDialog, addEvent, updateEvent, deleteEvent } =
    useCalendarStore();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isEventDialogOpen) {
      setConfirmDelete(false);
      if (editingEvent) {
        setForm({
          title: editingEvent.title,
          description: editingEvent.description || "",
          date: editingEvent.date,
          startTime: editingEvent.startTime || "09:00",
          endTime: editingEvent.endTime || "10:00",
          allDay: editingEvent.allDay,
          color: editingEvent.color,
          recurrence: editingEvent.recurrence,
          category: editingEvent.category || "",
        });
      } else {
        setForm({
          ...DEFAULT_FORM,
          date: selectedDate || format(new Date(), "yyyy-MM-dd"),
        });
      }
    }
  }, [isEventDialogOpen, editingEvent, selectedDate]);

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingEvent) {
      updateEvent(editingEvent.id, {
        ...form,
        startTime: form.allDay ? undefined : form.startTime,
        endTime: form.allDay ? undefined : form.endTime,
      });
    } else {
      addEvent({
        ...form,
        startTime: form.allDay ? undefined : form.startTime,
        endTime: form.allDay ? undefined : form.endTime,
      });
    }
    closeEventDialog();
  };

  const handleDelete = () => {
    if (!editingEvent) return;
    if (confirmDelete) {
      deleteEvent(editingEvent.id);
      closeEventDialog();
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <Dialog open={isEventDialogOpen} onOpenChange={(open) => !open && closeEventDialog()}>
      <DialogContent className="sm:max-w-md glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {editingEvent ? "Edit Event" : "New Event"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <input
            type="text"
            placeholder="Event title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            className="w-full bg-transparent text-lg font-semibold placeholder:text-muted-foreground/50 outline-none border-b border-border pb-2 focus:border-primary transition-colors"
          />

          {/* Color picker */}
          <div className="flex items-center gap-2">
            {COLORS.map((color) => {
              const c = EVENT_COLORS[color];
              return (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={cn(
                    "h-6 w-6 rounded-full transition-all",
                    c.dot,
                    form.color === color ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" : "opacity-60 hover:opacity-100"
                  )}
                />
              );
            })}
          </div>

          {/* Date + Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="bg-muted/50 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer ml-auto">
                <input
                  type="checkbox"
                  checked={form.allDay}
                  onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
                  className="accent-primary"
                />
                All day
              </label>
            </div>

            {!form.allDay && (
              <div className="flex items-center gap-2 pl-5">
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="bg-muted/50 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-muted-foreground text-xs">to</span>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="bg-muted/50 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex items-start gap-2">
            <AlignLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
            <textarea
              placeholder="Add description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/50 outline-none resize-none"
            />
          </div>

          {/* Category */}
          <div className="flex items-start gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: form.category === cat ? "" : cat })}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all",
                    form.category === cat
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div className="flex items-center gap-2">
            <Repeat className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={form.recurrence}
              onChange={(e) => setForm({ ...form, recurrence: e.target.value as RecurrenceRule })}
              className="bg-muted/50 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary flex-1"
            >
              {RECURRENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {editingEvent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className={cn(
                "h-8 gap-1.5 text-xs mr-auto transition-colors",
                confirmDelete ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:text-destructive"
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmDelete ? "Confirm delete" : "Delete"}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={closeEventDialog}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs gradient-brand text-white border-0 shadow-sm shadow-primary/20 hover:opacity-90"
            onClick={handleSave}
            disabled={!form.title.trim()}
          >
            {editingEvent ? "Save changes" : "Create event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
