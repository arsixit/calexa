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
  MoreHorizontal,
  CalendarDays,
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
    <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 glass border-b border-border/50 shrink-0 z-10">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-2 md:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl gradient-brand flex items-center justify-center shadow-md shadow-primary/30">
            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
          </div>
          <span className="font-bold text-base md:text-lg gradient-brand-text tracking-tight hidden sm:block">Calexa</span>
        </div>

        <div className="h-6 w-px bg-border hidden md:block" />

        <div className="flex items-center gap-0.5 md:gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 md:h-8 md:w-8 rounded-lg"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <motion.h1
            key={title}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs md:text-sm font-semibold min-w-[100px] md:min-w-[160px] text-center"
          >
            {title}
          </motion.h1>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 md:h-8 md:w-8 rounded-lg"
            onClick={() => navigateMonth(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-6 md:h-7 rounded-lg text-[11px] md:text-xs font-medium hidden sm:flex"
          onClick={navigateToToday}
        >
          Today
        </Button>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Command Palette Trigger */}
        <div className="hidden md:block">
          <CommandPalette />
        </div>

        {/* Calendar System Switcher — desktop only */}
        <div className="hidden lg:block">
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
        </div>

        {/* View Switcher — desktop only */}
        <div className="hidden sm:flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
          {(["month", "week", "day"] as CalendarView[]).map((v) => (
            <Button
              key={v}
              variant="ghost"
              size="sm"
              onClick={() => setView(v)}
              className={cn(
                "h-6 md:h-7 gap-1 md:gap-1.5 rounded-md px-1.5 md:px-2.5 text-xs transition-all",
                view === v
                  ? "bg-background shadow-sm text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {VIEW_ICONS[v]}
              <span className="hidden md:inline">{VIEW_LABELS[v]}</span>
            </Button>
          ))}
        </div>

        {/* Theme Toggle — desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 md:h-8 md:w-8 rounded-lg hidden sm:flex"
          onClick={nextTheme}
          title="Toggle theme"
        >
          <ThemeIcon className="h-4 w-4" />
        </Button>

        {/* Settings — desktop only */}
        <div className="hidden md:block">
          <SettingsPanel />
        </div>

        {/* Mobile overflow menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent transition-colors flex sm:hidden">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={navigateToToday} className="text-xs gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              Go to Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={nextTheme} className="text-xs gap-2">
              <ThemeIcon className="h-3.5 w-3.5" />
              {theme === "light" ? "Switch to Dark" : theme === "dark" ? "Switch to System" : "Switch to Light"}
            </DropdownMenuItem>
            {(["month", "week", "day"] as CalendarView[]).map((v) => (
              <DropdownMenuItem
                key={v}
                onClick={() => setView(v)}
                className={cn("text-xs gap-2", view === v && "text-primary font-semibold")}
              >
                {VIEW_ICONS[v]}
                {VIEW_LABELS[v]} view
              </DropdownMenuItem>
            ))}
            {(Object.keys(CALENDAR_SYSTEM_LABELS) as CalendarSystem[]).map((sys) => (
              <DropdownMenuItem
                key={sys}
                onClick={() => setCalendarSystem(sys)}
                className={cn("text-xs gap-2", calendarSystem === sys && "text-primary font-semibold")}
              >
                <Calendar className="h-3.5 w-3.5" />
                {CALENDAR_SYSTEM_LABELS[sys]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <UserMenu />

        {/* New Event */}
        <Button
          size="sm"
          className="h-7 md:h-8 gap-1 md:gap-1.5 rounded-lg gradient-brand text-white border-0 shadow-md shadow-primary/30 hover:opacity-90 hover:shadow-primary/40 transition-all px-2 md:px-3"
          onClick={() => openNewEventDialog()}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">New Event</span>
        </Button>
      </div>
    </header>
  );
}
