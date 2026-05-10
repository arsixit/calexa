"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, addDays } from "date-fns";
import {
  Calendar,
  LayoutGrid,
  Columns3,
  AlignJustify,
  Plus,
  Search,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { useCalendarStore } from "@/lib/store";
import { CALENDAR_SYSTEM_LABELS, EVENT_COLORS, type CalendarSystem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
  keywords?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { theme, setTheme } = useTheme();
  const {
    setView,
    navigateToToday,
    setCalendarSystem,
    openNewEventDialog,
    openEditEventDialog,
    events,
    currentDate,
    setCurrentDate,
  } = useCalendarStore();

  const close = useCallback(() => {
    setOpen(false);
    setSearch("");
  }, []);

  // Global keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (!open) {
        // Single-key shortcuts (only when palette is closed)
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        switch (e.key) {
          case "n": openNewEventDialog(); break;
          case "t": navigateToToday(); break;
          case "m": setView("month"); break;
          case "w": setView("week"); break;
          case "d": setView("day"); break;
          case "ArrowLeft": useCalendarStore.getState().navigateMonth(-1); break;
          case "ArrowRight": useCalendarStore.getState().navigateMonth(1); break;
        }
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close, navigateToToday, setView, openNewEventDialog]);

  // Build command list
  const staticCommands: CommandItem[] = [
    {
      id: "new-event",
      label: "New Event",
      description: "Create a new calendar event",
      icon: <Plus className="h-4 w-4" />,
      action: () => { openNewEventDialog(); close(); },
      group: "Actions",
      keywords: "create add event",
    },
    {
      id: "today",
      label: "Go to Today",
      icon: <Calendar className="h-4 w-4" />,
      action: () => { navigateToToday(); close(); },
      group: "Navigation",
      keywords: "today now current",
    },
    {
      id: "view-month",
      label: "Month View",
      icon: <LayoutGrid className="h-4 w-4" />,
      action: () => { setView("month"); close(); },
      group: "Views",
      keywords: "month grid calendar",
    },
    {
      id: "view-week",
      label: "Week View",
      icon: <Columns3 className="h-4 w-4" />,
      action: () => { setView("week"); close(); },
      group: "Views",
      keywords: "week 7 days",
    },
    {
      id: "view-day",
      label: "Day View",
      icon: <AlignJustify className="h-4 w-4" />,
      action: () => { setView("day"); close(); },
      group: "Views",
      keywords: "day single agenda",
    },
    {
      id: "cal-gregorian",
      label: "Switch to Gregorian",
      icon: <Calendar className="h-4 w-4" />,
      action: () => { setCalendarSystem("gregorian"); close(); },
      group: "Calendar System",
      keywords: "gregorian western english",
    },
    {
      id: "cal-jalali",
      label: "Switch to Jalali (Persian)",
      icon: <Calendar className="h-4 w-4" />,
      action: () => { setCalendarSystem("jalali"); close(); },
      group: "Calendar System",
      keywords: "jalali persian shamsi iranian",
    },
    {
      id: "cal-hijri",
      label: "Switch to Hijri (Islamic)",
      icon: <Calendar className="h-4 w-4" />,
      action: () => { setCalendarSystem("hijri"); close(); },
      group: "Calendar System",
      keywords: "hijri islamic arabic",
    },
    {
      id: "theme-light",
      label: "Light Mode",
      icon: <Sun className="h-4 w-4" />,
      action: () => { setTheme("light"); close(); },
      group: "Theme",
      keywords: "light white bright theme",
    },
    {
      id: "theme-dark",
      label: "Dark Mode",
      icon: <Moon className="h-4 w-4" />,
      action: () => { setTheme("dark"); close(); },
      group: "Theme",
      keywords: "dark black night theme",
    },
    {
      id: "theme-system",
      label: "System Theme",
      icon: <Monitor className="h-4 w-4" />,
      action: () => { setTheme("system"); close(); },
      group: "Theme",
      keywords: "system auto theme",
    },
  ];

  // Upcoming events as commands
  const today = format(new Date(), "yyyy-MM-dd");
  const eventCommands: CommandItem[] = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10)
    .map((event) => ({
      id: `event-${event.id}`,
      label: event.title,
      description: `${format(parseISO(event.date), "MMM d")}${event.startTime ? ` · ${event.startTime}` : ""}`,
      icon: <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", EVENT_COLORS[event.color].dot)} />,
      action: () => { openEditEventDialog(event); close(); },
      group: "Events",
      keywords: event.title + " " + (event.description || ""),
    }));

  const allCommands = [...staticCommands, ...eventCommands];

  // Group by category for display
  const grouped = allCommands.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  return (
    <>
      {/* Trigger hint in header */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-muted/50 text-xs text-muted-foreground hover:bg-accent transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search or jump to...</span>
        <kbd className="ml-2 px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={close}
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
            >
              <Command
                className="rounded-2xl border border-border glass-card shadow-2xl shadow-black/30 overflow-hidden"
                shouldFilter={true}
              >
                <div className="flex items-center gap-3 px-4 border-b border-border/50">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search commands, events..."
                    className="flex-1 py-4 text-sm bg-transparent outline-none placeholder:text-muted-foreground/60"
                    autoFocus
                  />
                  <kbd
                    onClick={close}
                    className="px-1.5 py-0.5 rounded border border-border text-[10px] text-muted-foreground font-mono cursor-pointer hover:bg-accent"
                  >
                    ESC
                  </kbd>
                </div>

                <Command.List className="max-h-80 overflow-y-auto py-2 scrollbar-hide">
                  <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                    No results found.
                  </Command.Empty>

                  {Object.entries(grouped).map(([group, cmds]) => (
                    <Command.Group
                      key={group}
                      heading={group}
                      className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
                    >
                      {cmds.map((cmd) => (
                        <Command.Item
                          key={cmd.id}
                          value={`${cmd.label} ${cmd.keywords || ""} ${cmd.description || ""}`}
                          onSelect={cmd.action}
                          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-lg mx-2 text-sm data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground transition-colors"
                        >
                          <span className="text-muted-foreground shrink-0">{cmd.icon}</span>
                          <span className="flex-1 font-medium">{cmd.label}</span>
                          {cmd.description && (
                            <span className="text-xs text-muted-foreground">{cmd.description}</span>
                          )}
                          <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 data-[selected=true]:opacity-100" />
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>

                {/* Footer */}
                <div className="border-t border-border/50 px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> select</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono">N</kbd> new event</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono">M W D</kbd> views</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono">← →</kbd> navigate month</span>
                </div>
              </Command>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
