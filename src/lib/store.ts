import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format, addMonths, subMonths } from "date-fns";
import type { CalendarStore, CalendarEvent, CalendarView, CalendarSystem } from "./types";

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const STORAGE_NAME = "calexa-storage";
let currentStorageUserId: string | null = null;

export function setStorageUserId(userId: string | null) {
  currentStorageUserId = userId;
}

function getStorageSubKey() {
  return currentStorageUserId ? `user:${currentStorageUserId}` : "guest";
}

const dynamicStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as Record<string, unknown>;
      const value = data[getStorageSubKey()];
      return value ? JSON.stringify(value) : null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(name);
      const data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      data[getStorageSubKey()] = JSON.parse(value);
      window.localStorage.setItem(name, JSON.stringify(data));
    } catch {
      window.localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(name);
      if (!raw) return;
      const data = JSON.parse(raw) as Record<string, unknown>;
      delete data[getStorageSubKey()];
      window.localStorage.setItem(name, JSON.stringify(data));
    } catch {
      window.localStorage.removeItem(name);
    }
  },
};

// Lazily imported so server bundle doesn't break
async function getDb() {
  return import("./supabase/events-db");
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { createClient } = await import("./supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

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

      addEvent: async (eventData) => {
        const timestamp = new Date().toISOString();
        const event: CalendarEvent = {
          ...eventData,
          id: generateId(),
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        set((state) => ({ events: [...state.events, event] }));

        const userId = await getCurrentUserId();
        if (userId) {
          const db = await getDb();
          await db.upsertEvent(event, userId).catch(console.error);
        }
      },

      updateEvent: async (id, updates) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }));

        const userId = await getCurrentUserId();
        if (userId) {
          const updated = get().events.find((e) => e.id === id);
          if (updated) {
            const db = await getDb();
            await db.upsertEvent(updated, userId).catch(console.error);
          }
        }
      },

      deleteEvent: async (id) => {
        set((state) => ({ events: state.events.filter((e) => e.id !== id) }));

        const userId = await getCurrentUserId();
        if (userId) {
          const db = await getDb();
          await db.removeEvent(id).catch(console.error);
        }
      },

      setView: (view) => set({ view }),
      setCalendarSystem: (calendarSystem) => set({ calendarSystem }),

      navigateMonth: (direction) => {
        const { currentDate } = get();
        const current = new Date(currentDate);
        const next = direction === 1 ? addMonths(current, 1) : subMonths(current, 1);
        set({ currentDate: format(next, "yyyy-MM-dd") });
      },

      navigateToToday: () => set({ currentDate: format(new Date(), "yyyy-MM-dd") }),
      setCurrentDate: (date) => set({ currentDate: date }),
      setSelectedDate: (date) => set({ selectedDate: date }),

      openNewEventDialog: (date) => {
        set({
          editingEvent: null,
          selectedDate: date || get().selectedDate,
          isEventDialogOpen: true,
        });
      },

      openEditEventDialog: (event) => set({ editingEvent: event, isEventDialogOpen: true }),
      closeEventDialog: () => set({ editingEvent: null, isEventDialogOpen: false }),
      setEvents: (events) => set({ events }),
      setStorageUser: (userId) => {
        setStorageUserId(userId);
      },
      loadUserState: (userId) => {
        setStorageUserId(userId);
        if (typeof window === "undefined") return;
        try {
          const raw = window.localStorage.getItem(STORAGE_NAME);
          if (!raw) return;
          const all = JSON.parse(raw) as Record<string, unknown>;
          const persisted = all[getStorageSubKey()];
          if (persisted && typeof persisted === "object") {
            const data = persisted as Partial<Pick<CalendarStore, "events" | "view" | "calendarSystem">>;
            set({
              events: data.events ?? get().events,
              view: data.view ?? get().view,
              calendarSystem: data.calendarSystem ?? get().calendarSystem,
            });
          }
        } catch {
          // silent fail
        }
      },
    }),
    {
      name: "calexa-storage",
      storage: dynamicStorage as unknown as any,
      partialize: (state) => ({
        events: state.events,
        view: state.view,
        calendarSystem: state.calendarSystem,
      }),
    }
  )
);
