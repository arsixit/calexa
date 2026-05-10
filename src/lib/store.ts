import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format, addMonths, subMonths } from "date-fns";
import type { CalendarStore, CalendarEvent, CalendarView, CalendarSystem, RecurrenceRule, EventColor } from "./types";

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      events: [],
      view: "month",
      calendarSystem: "gregorian",
      currentDate: format(new Date(), "yyyy-MM-dd"),
      selectedDate: null,
      editingEvent: null,
      isEventDialogOpen: false,

      addEvent: (eventData) => {
        const event: CalendarEvent = {
          ...eventData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ events: [...state.events, event] }));
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },

      setView: (view) => set({ view }),

      setCalendarSystem: (calendarSystem) => set({ calendarSystem }),

      navigateMonth: (direction) => {
        const { currentDate } = get();
        const current = new Date(currentDate);
        const next = direction === 1 ? addMonths(current, 1) : subMonths(current, 1);
        set({ currentDate: format(next, "yyyy-MM-dd") });
      },

      navigateToToday: () => {
        set({ currentDate: format(new Date(), "yyyy-MM-dd") });
      },

      setCurrentDate: (date) => set({ currentDate: date }),

      setSelectedDate: (date) => set({ selectedDate: date }),

      openNewEventDialog: (date) => {
        set({
          editingEvent: null,
          selectedDate: date || get().selectedDate,
          isEventDialogOpen: true,
        });
      },

      openEditEventDialog: (event) => {
        set({ editingEvent: event, isEventDialogOpen: true });
      },

      closeEventDialog: () => {
        set({ editingEvent: null, isEventDialogOpen: false });
      },
    }),
    {
      name: "calexa-storage",
      partialize: (state) => ({
        events: state.events,
        view: state.view,
        calendarSystem: state.calendarSystem,
      }),
    }
  )
);
