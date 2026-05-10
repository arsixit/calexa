"use client";

import { useRef } from "react";
import { Settings, Download, Upload, Trash2, Calendar, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCalendarStore } from "@/lib/store";
import { exportToICS, parseICS } from "@/lib/ics";
import { Button } from "@/components/ui/button";

export function SettingsPanel() {
  const { events, addEvent } = useCalendarStore();
  const importRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportToICS(events);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const parsed = parseICS(content);
      parsed.forEach((event) => addEvent(event));
      alert(`Imported ${parsed.length} event${parsed.length !== 1 ? "s" : ""} successfully!`);
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
