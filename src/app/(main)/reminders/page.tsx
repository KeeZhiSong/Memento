"use client";

import { MOCK_REMINDERS } from "@/lib/mock-data";
import { useLanguage } from "@/hooks/useLanguage";

export default function RemindersPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[100dvh] bg-cream-50 pt-24 px-5">
      <div className="glass-heavy rounded-2xl p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-navy mb-4">{t("reminders.title")}</h1>
        <ul className="space-y-3">
          {MOCK_REMINDERS.map((r) => (
            <li key={r.id} className="flex items-center gap-3 text-navy">
              <span className="w-2 h-2 rounded-full bg-warm-pink shrink-0" />
              <div>
                <p className="font-semibold text-sm">{r.text}</p>
                <p className="text-xs text-navy/50">{r.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
