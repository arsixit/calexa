"use client";

import { useRef } from "react";
import { Settings, Download, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCalendarStore } from "@/lib/store";
import { exportToICS, parseICS } from "@/lib/ics";
import { useNotification } from "@/components/providers/notification-provider";
import type { CalendarEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function SettingsPanel() {
  const { events, addEvent } = useCalendarStore();
  const importRef = useRef<HTMLInputElement>(null);
  const { notify } = useNotification();

  const createEventKey = (event: Omit<CalendarEvent, "id" | "createdAt">) => {
    return [
      event.title.trim().toLowerCase(),
      event.date,
      event.allDay ? "all-day" : `${event.startTime ?? ""}-${event.endTime ?? ""}`,
      event.recurrence,
      event.category?.trim().toLowerCase() ?? "",
    ].join("|");
  };

  const handleExport = () => {
    exportToICS(events);
    notify("Exported calendar to .ics", { variant: "success" });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const content = ev.target?.result as string;
        const parsed = parseICS(content);
        const existingKeys = new Set(events.map((event) => createEventKey(event)));
        const uniqueEvents = parsed.filter((event) => {
          const key = createEventKey(event);
          if (existingKeys.has(key)) return false;
          existingKeys.add(key);
          return true;
        });

        await Promise.all(uniqueEvents.map((event) => addEvent(event)));
        if (uniqueEvents.length > 0) {
          notify(`Imported ${uniqueEvents.length} new event${uniqueEvents.length !== 1 ? "s" : ""} successfully!`, { variant: "success" });
        } else {
          notify("No new events were imported. Duplicates were skipped.", { variant: "info" });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        notify(`Import failed: ${message}`, { variant: "error" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={importRef}
        type="file"
        accept=".ics"
        className="hidden"
        onChange={handleImport}
      />
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold text-foreground">Calendar Data</p>
            <p className="text-[10px] text-muted-foreground">{events.length} event{events.length !== 1 ? "s" : ""}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleExport}
            className="text-xs gap-2 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export as .ics
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => importRef.current?.click()}
            className="text-xs gap-2 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            Import .ics file
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              .ics files are compatible with Google Calendar, Apple Calendar, and Outlook.
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
