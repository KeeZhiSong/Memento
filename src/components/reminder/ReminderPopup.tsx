"use client";

import { useEffect, useRef, useState } from "react";
import { getOrCreateSessionId } from "@/lib/client-session";

interface ReminderNotificationApiItem {
  reminderId: string;
  title: string;
  eventAt: string;
  scheduledFor: string;
  offsetHours: 12 | 6 | 1 | 0;
}

export default function ReminderPopup() {
  const [sessionId, setSessionId] = useState<string>("");
  const [dueReminder, setDueReminder] =
    useState<ReminderNotificationApiItem | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const checkReminders = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      try {
        const response = await fetch(
          `/api/reminders?sessionId=${encodeURIComponent(sessionId)}&dueOnly=true&markNotified=true`,
        );

        if (!response.ok) return;

        const data = await response.json();
        const notifications: ReminderNotificationApiItem[] =
          data.notifications ?? [];

        if (notifications.length > 0) {
          setDueReminder((current) => current ?? notifications[0]);
        }
      } catch {
        // ignore polling failures
      } finally {
        inFlightRef.current = false;
      }
    };

    checkReminders();
    const interval = window.setInterval(checkReminders, 30000);
    return () => window.clearInterval(interval);
  }, [sessionId]);

  return dueReminder ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-navy">Reminder due</p>
            <p className="mt-1 text-sm text-navy/80">{dueReminder.title}</p>
          </div>
          <button
            type="button"
            onClick={() => setDueReminder(null)}
            className="text-navy/70 hover:text-navy"
            aria-label="Close reminder"
          >
            ×
          </button>
        </div>
        <p className="mt-3 text-sm text-navy">
          {new Date(dueReminder.eventAt).toLocaleString()}
        </p>
        <p className="mt-2 text-xs text-navy/60">
          {dueReminder.offsetHours === 0
            ? "Due now"
            : `${dueReminder.offsetHours} hour${dueReminder.offsetHours === 1 ? "" : "s"} before`}
        </p>
      </div>
    </div>
  ) : null;
}
