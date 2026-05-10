"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Calendar,
  LayoutGrid,
  Columns3,
  AlignJustify,
  Plus,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCalendarStore } from "@/lib/store";
import { formatMonthYear } from "@/lib/calendar-engine";
import { CALENDAR_SYSTEM_LABELS, type CalendarSystem, type CalendarView } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "@/components/command-palette";
import { SettingsPanel } from "@/components/settings-panel";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

const VIEW_ICONS: Record<CalendarView, React.ReactNode> = {
  month: <LayoutGrid className="h-4 w-4" />,
  week: <Columns3 className="h-4 w-4" />,
  day: <AlignJustify className="h-4 w-4" />,
};

const VIEW_LABELS: Record<CalendarView, string> = {
  month: "Month",
  week: "Week",
  day: "Day",
};

export function Header() {
  const { theme, setTheme } = useTheme();
  const {
    currentDate,
    view,
    calendarSystem,
    navigateMonth,
    navigateToToday,
    setView,
    setCalendarSystem,
    openNewEventDialog,
  } = useCalendarStore();

  const date = parseISO(currentDate);
  const title = formatMonthYear(date, calendarSystem);

  const nextTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <header className="h-16 flex items-center justify-between px-6 glass border-b border-border/50 shrink-0 z-10">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-md shadow-primary/30">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg gradient-brand-text tracking-tight">Calexa</span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <motion.h1
            key={title}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold min-w-[160px] text-center"
          >
            {title}
          </motion.h1>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => navigateMonth(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-lg text-xs font-medium"
          onClick={navigateToToday}
        >
          Today
        </Button>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <CommandPalette />

        {/* Calendar System Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
            <Calendar className="h-3.5 w-3.5" />
            {CALENDAR_SYSTEM_LABELS[calendarSystem]}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {(Object.keys(CALENDAR_SYSTEM_LABELS) as CalendarSystem[]).map((sys) => (
              <DropdownMenuItem
                key={sys}
                onClick={() => setCalendarSystem(sys)}
                className={cn("text-xs", calendarSystem === sys && "text-primary font-semibold")}
              >
                {CALENDAR_SYSTEM_LABELS[sys]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Switcher */}
        <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
          {(["month", "week", "day"] as CalendarView[]).map((v) => (
            <Button
              key={v}
              variant="ghost"
              size="sm"
              onClick={() => setView(v)}
              className={cn(
                "h-7 gap-1.5 rounded-md px-2.5 text-xs transition-all",
                view === v
                  ? "bg-background shadow-sm text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {VIEW_ICONS[v]}
              {VIEW_LABELS[v]}
            </Button>
          ))}
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={nextTheme}
          title="Toggle theme"
        >
          <ThemeIcon className="h-4 w-4" />
        </Button>

        {/* Settings */}
        <SettingsPanel />

        {/* User Menu */}
        <UserMenu />

        {/* New Event */}
        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-lg gradient-brand text-white border-0 shadow-md shadow-primary/30 hover:opacity-90 hover:shadow-primary/40 transition-all"
          onClick={() => openNewEventDialog()}
        >
          <Plus className="h-3.5 w-3.5" />
          New Event
        </Button>
      </div>
    </header>
  );
}
