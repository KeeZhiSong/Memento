"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useMode } from "@/hooks/useMode";

// ── Types ──
type ReminderType = "general" | "medication";

interface Reminder {
  id: string;
  text: string;
  time: string;
  type: ReminderType;
  dosage?: string;
  frequency?: string;
  taken?: boolean;
}

// ── Constants ──
const STORAGE_KEY = "memento-reminders";

const SEED_REMINDERS: Reminder[] = [
  { id: "r1", text: "Take morning medication", time: "8:00 AM", type: "medication", dosage: "1 tablet", frequency: "Daily" },
  { id: "r2", text: "Doctor appointment — Dr. Tan", time: "2:00 PM", type: "general" },
  { id: "r3", text: "Take evening medication", time: "8:00 PM", type: "medication", dosage: "2 tablets", frequency: "Daily" },
  { id: "r4", text: "Marcus's piano recital", time: "5:00 PM", type: "general" },
];

function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return SEED_REMINDERS;
}

function saveReminders(reminders: Reminder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

// ── Icons ──
function PlusIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function EditIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// ── Main Component ──
export default function RemindersPage() {
  const { t } = useLanguage();
  const { mode } = useMode();
  const isCaretaker = mode === "caretaker";

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    setReminders(loadReminders());
    setMounted(true);
  }, []);

  const updateReminders = (updated: Reminder[]) => {
    setReminders(updated);
    saveReminders(updated);
  };

  const handleToggleTaken = (id: string) => {
    updateReminders(
      reminders.map((r) => (r.id === id ? { ...r, taken: !r.taken } : r))
    );
  };

  const handleDelete = (id: string) => {
    updateReminders(reminders.filter((r) => r.id !== id));
  };

  const handleSave = (reminder: Reminder) => {
    if (editingReminder) {
      updateReminders(reminders.map((r) => (r.id === reminder.id ? reminder : r)));
    } else {
      updateReminders([...reminders, reminder]);
    }
    setShowSheet(false);
    setEditingReminder(null);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowSheet(true);
  };

  const handleAdd = () => {
    setEditingReminder(null);
    setShowSheet(true);
  };

  const medications = reminders.filter((r) => r.type === "medication");
  const general = reminders.filter((r) => r.type === "general");

  if (!mounted) return null;

  return (
    <div className="h-[100dvh] overflow-y-auto bg-cream-50 pt-24 px-5 pb-28">
      <div className="max-w-md mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-navy">
          {t("reminders.title") ?? "Reminders"}
        </h1>

        {/* Medications Section */}
        {medications.length > 0 && (
          <div className="glass-heavy rounded-2xl p-5">
            <h2 className="text-sm font-bold text-navy/50 mb-3 flex items-center gap-2">
              <span>💊</span>
              {t("reminders.medications") ?? "Medications"}
            </h2>
            <ul className="space-y-2">
              {medications.map((r) => (
                <li
                  key={r.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    r.taken ? "bg-sage/20" : "bg-warm-pink/10"
                  }`}
                >
                  <button
                    onClick={() => handleToggleTaken(r.id)}
                    className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                      r.taken
                        ? "bg-sage border-sage text-white"
                        : "border-warm-pink"
                    }`}
                  >
                    {r.taken && (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${r.taken ? "text-navy/40 line-through" : "text-navy"}`}>
                      {r.text}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-navy/50">{r.time}</span>
                      {r.dosage && (
                        <span className="text-xs text-navy/40 bg-white/50 px-1.5 py-0.5 rounded-full">
                          {r.dosage}
                        </span>
                      )}
                      {r.frequency && (
                        <span className="text-xs text-navy/40 bg-white/50 px-1.5 py-0.5 rounded-full">
                          {r.frequency}
                        </span>
                      )}
                    </div>
                  </div>
                  {isCaretaker && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(r)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-navy/30 hover:text-navy/60 active:scale-90 transition-all"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-navy/30 hover:text-warm-pink active:scale-90 transition-all"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* General Reminders Section */}
        <div className="glass-heavy rounded-2xl p-5">
          <h2 className="text-sm font-bold text-navy/50 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal inline-block" />
            {t("reminders.general") ?? "General"}
          </h2>
          {general.length === 0 ? (
            <p className="text-sm text-navy/40 font-semibold">No reminders</p>
          ) : (
            <ul className="space-y-2">
              {general.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/30"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-teal shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-navy">{r.text}</p>
                    <p className="text-xs text-navy/50">{r.time}</p>
                  </div>
                  {isCaretaker && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(r)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-navy/30 hover:text-navy/60 active:scale-90 transition-all"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-navy/30 hover:text-warm-pink active:scale-90 transition-all"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* FAB (caretaker only) */}
      {isCaretaker && (
        <button
          onClick={handleAdd}
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-teal text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40"
          aria-label="Add reminder"
        >
          <PlusIcon />
        </button>
      )}

      {/* Add/Edit Sheet */}
      {showSheet && (
        <ReminderSheet
          reminder={editingReminder}
          onClose={() => { setShowSheet(false); setEditingReminder(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ── Add/Edit Sheet ──
function ReminderSheet({
  reminder,
  onClose,
  onSave,
}: {
  reminder: Reminder | null;
  onClose: () => void;
  onSave: (r: Reminder) => void;
}) {
  const { t } = useLanguage();
  const isEditing = !!reminder;

  const [text, setText] = useState(reminder?.text ?? "");
  const [time, setTime] = useState(reminder?.time ?? "9:00 AM");
  const [type, setType] = useState<ReminderType>(reminder?.type ?? "general");
  const [dosage, setDosage] = useState(reminder?.dosage ?? "");
  const [frequency, setFrequency] = useState(reminder?.frequency ?? "Daily");

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({
      id: reminder?.id ?? `r-${Date.now()}`,
      text: text.trim(),
      time,
      type,
      dosage: type === "medication" ? dosage.trim() || undefined : undefined,
      frequency: type === "medication" ? frequency : undefined,
      taken: reminder?.taken ?? false,
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 animate-[fade-in-up_0.3s_ease-out]">
        <div
          className="glass-heavy rounded-t-3xl px-6 pt-5 pb-8 max-w-md mx-auto"
          style={{ background: "rgba(255,248,240,0.95)", backdropFilter: "blur(30px)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-navy">
              {isEditing
                ? (t("reminders.edit") ?? "Edit Reminder")
                : (t("reminders.add") ?? "New Reminder")}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-navy/40 active:bg-navy/10 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="text-xs font-bold text-navy/50 mb-1.5 block">
                {t("reminders.type") ?? "Type"}
              </label>
              <div className="flex gap-2">
                {(["general", "medication"] as ReminderType[]).map((tp) => (
                  <button
                    key={tp}
                    onClick={() => setType(tp)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                      type === tp
                        ? "bg-teal text-white shadow-sm"
                        : "bg-white/50 text-navy/50 border border-navy/10"
                    }`}
                  >
                    {tp === "general" ? "General" : "Medication"}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-navy/50 mb-1.5 block">
                {t("reminders.name") ?? "Name"}
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Take blood pressure medication"
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-navy/10 text-sm font-semibold text-navy placeholder:text-navy/30 outline-none focus:border-teal transition-colors"
              />
            </div>

            {/* Time */}
            <div>
              <label className="text-xs font-bold text-navy/50 mb-1.5 block">
                {t("reminders.time") ?? "Time"}
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 8:00 AM"
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-navy/10 text-sm font-semibold text-navy placeholder:text-navy/30 outline-none focus:border-teal transition-colors"
              />
            </div>

            {/* Medication-specific fields */}
            {type === "medication" && (
              <>
                <div>
                  <label className="text-xs font-bold text-navy/50 mb-1.5 block">
                    {t("reminders.dosage") ?? "Dosage"}
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 1 tablet, 5ml"
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-navy/10 text-sm font-semibold text-navy placeholder:text-navy/30 outline-none focus:border-teal transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/50 mb-1.5 block">
                    {t("reminders.frequency") ?? "Frequency"}
                  </label>
                  <div className="flex gap-2">
                    {["Daily", "Twice daily", "Weekly"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFrequency(f)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                          frequency === f
                            ? "bg-teal text-white shadow-sm"
                            : "bg-white/50 text-navy/50 border border-navy/10"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!text.trim()}
              className={`w-full py-3.5 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.98] ${
                text.trim() ? "bg-teal shadow-sm" : "bg-navy/20"
              }`}
            >
              {isEditing ? (t("reminders.save") ?? "Save") : (t("reminders.add") ?? "Add Reminder")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
