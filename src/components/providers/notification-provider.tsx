"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Toast, type ToastVariant } from "@/components/ui/toast";

export interface NotificationOptions {
  title?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface Notification {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface NotificationContextValue {
  notify: (message: string, options?: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, options: NotificationOptions = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const notification: Notification = {
      id,
      title: options.title,
      message,
      variant: options.variant ?? "info",
      duration: options.duration ?? 4000,
    };
    setNotifications((current) => [...current, notification]);

    if (notification.duration > 0) {
      window.setTimeout(() => {
        setNotifications((current) => current.filter((item) => item.id !== id));
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-auto max-w-sm flex-col gap-3">
        <AnimatePresence initial={false}>
          {notifications.map((notification) => (
            <Toast
              key={notification.id}
              title={notification.title}
              message={notification.message}
              variant={notification.variant}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
