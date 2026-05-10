"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCalendarStore } from "@/lib/store";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { MonthView } from "@/components/views/month-view";
import { WeekView } from "@/components/views/week-view";
import { DayView } from "@/components/views/day-view";
import { EventDialog } from "@/components/event-dialog";

export default function CalexaApp() {
  const { view } = useCalendarStore();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden relative">
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
