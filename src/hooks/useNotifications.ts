"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ──
export interface AppNotification {
  id: string;
  type: "mood" | "medication" | "checkin";
  message: string;
  severity: "warning" | "info";
  timestamp: number;
}

// ── localStorage keys (shared with other pages) ──
const MOOD_KEY = "memento-mood";
const REMINDERS_KEY = "memento-reminders";
const DISMISSED_KEY = "memento-notifications-dismissed";

interface MoodEntry {
  date: string;
  key: string;
}

interface Reminder {
  id: string;
  text: string;
  time: string;
  type: "general" | "medication";
  taken?: boolean;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === getTodayKey()) return new Set(parsed.ids);
    }
  } catch { /* ignore */ }
  return new Set();
}

function saveDismissed(ids: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify({ date: getTodayKey(), ids: [...ids] }));
}

function generateNotifications(): AppNotification[] {
  const today = getTodayKey();
  const notifications: AppNotification[] = [];

  // Check mood
  try {
    const raw = localStorage.getItem(MOOD_KEY);
    if (raw) {
      const mood: MoodEntry = JSON.parse(raw);
      if (mood.date === today) {
        if (mood.key === "wellness.mood.sad" || mood.key === "wellness.mood.low") {
          notifications.push({
            id: `mood-low-${today}`,
            type: "mood",
            message: "Mood is low today — consider checking in",
            severity: "warning",
            timestamp: Date.now(),
          });
        }
      } else {
        notifications.push({
          id: `checkin-missing-${today}`,
          type: "checkin",
          message: "No mood check-in today",
          severity: "info",
          timestamp: Date.now(),
        });
      }
    } else {
      notifications.push({
        id: `checkin-missing-${today}`,
        type: "checkin",
        message: "No mood check-in today",
        severity: "info",
        timestamp: Date.now(),
      });
    }
  } catch { /* ignore */ }

  // Check medications
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (raw) {
      const reminders: Reminder[] = JSON.parse(raw);
      const medications = reminders.filter((r) => r.type === "medication");
      const missed = medications.filter((r) => !r.taken);
      if (missed.length > 0) {
        notifications.push({
          id: `meds-missed-${today}`,
          type: "medication",
          message: `${missed.length} medication${missed.length > 1 ? "s" : ""} not taken yet`,
          severity: "warning",
          timestamp: Date.now(),
        });
      }
    }
  } catch { /* ignore */ }

  return notifications;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const refresh = useCallback(() => {
    const all = generateNotifications();
    const currentDismissed = getDismissed();
    setDismissed(currentDismissed);
    setNotifications(all.filter((n) => !currentDismissed.has(n.id)));
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [refresh]);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDismissed(next);
      return next;
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    const allIds = new Set(dismissed);
    notifications.forEach((n) => allIds.add(n.id));
    saveDismissed(allIds);
    setDismissed(allIds);
    setNotifications([]);
  }, [dismissed, notifications]);

  return { notifications, count: notifications.length, dismiss, dismissAll, refresh };
}
