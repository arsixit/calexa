"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCalendarStore } from "@/lib/store";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { MonthView } from "@/components/views/month-view";
import { WeekView } from "@/components/views/week-view";
import { DayView } from "@/components/views/day-view";
import { EventDialog } from "@/components/event-dialog";

export default function CalexaApp() {
  const { view, navigateMonth } = useCalendarStore();
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) navigateMonth(diff > 0 ? 1 : -1);
    touchStartX.current = null;
  };

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-brand animate-pulse" />
          <p className="text-sm text-muted-foreground font-medium">Loading Calexa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className="flex-1 flex flex-col overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {view === "month" && <MonthView />}
              {view === "week" && <WeekView />}
              {view === "day" && <DayView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <EventDialog />
    </div>
  );
}
