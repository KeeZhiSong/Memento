"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { MOCK_SCHEDULE } from "@/lib/mock-data";
import { useLanguage } from "@/hooks/useLanguage";
import { useMode } from "@/hooks/useMode";

const SCHEDULE_STORAGE_KEY = "memento-schedule";

// ─── Types ───────────────────────────────────────────────
type EventType = "routine" | "activity" | "medical" | "family";
type ViewMode = "month" | "week" | "day";

interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  type: EventType;
  notes?: string;
  date: string; // YYYY-MM-DD
}

// ─── Constants ───────────────────────────────────────────
const TYPE_COLORS: Record<EventType, string> = {
  routine: "bg-sage",
  activity: "bg-teal",
  medical: "bg-warm-pink",
  family: "bg-earth-light",
};

const TYPE_BORDER_COLORS: Record<EventType, string> = {
  routine: "border-sage",
  activity: "border-teal",
  medical: "border-warm-pink",
  family: "border-earth-light",
};

const TYPE_LABEL_KEYS: Record<EventType, string> = {
  routine: "schedule.type.routine",
  activity: "schedule.type.activity",
  medical: "schedule.type.medical",
  family: "schedule.type.family",
};

const WEEKDAY_KEYS = ["day.sun", "day.mon", "day.tue", "day.wed", "day.thu", "day.fri", "day.sat"];

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseTimeToHour(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 8;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h + m / 60;
}

// ─── Seed data with today's date ─────────────────────────
function seedEvents(): ScheduleEvent[] {
  const today = toDateStr(new Date());
  return MOCK_SCHEDULE.map((item) => ({
    ...item,
    date: today,
    type: item.type as EventType,
  }));
}

// ─── SVG Icons ───────────────────────────────────────────
function ChevronLeft({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

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

// ─── Date Helpers ────────────────────────────────────────
function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay(); // 0=Sun
  const totalDays = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getWeekDays(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const sunday = new Date(baseDate);
  sunday.setDate(baseDate.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ─── localStorage helpers ────────────────────────────────
function loadEvents(): ScheduleEvent[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return seedEvents();
}

function saveEvents(events: ScheduleEvent[]) {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(events));
}

// ─── Edit/Trash Icons ───────────────────────────────────
function EditIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

// ─── Main Component ──────────────────────────────────────
export default function SchedulePage() {
  const { t } = useLanguage();
  const { mode } = useMode();
  const isCaretaker = mode === "caretaker";
  const today = useMemo(() => new Date(), []);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [viewDate, setViewDate] = useState<Date>(today);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  useEffect(() => {
    setEvents(loadEvents());
    setMounted(true);
  }, []);

  const selectedDateStr = toDateStr(selectedDate);
  const todayStr = toDateStr(today);

  const eventsForDate = useCallback(
    (dateStr: string) => events.filter((e) => e.date === dateStr),
    [events]
  );

  const selectedEvents = useMemo(
    () => eventsForDate(selectedDateStr),
    [eventsForDate, selectedDateStr]
  );

  const eventDatesSet = useMemo(
    () => new Set(events.map((e) => e.date)),
    [events]
  );

  // Navigation
  const navigatePrev = () => {
    const d = new Date(viewDate);
    if (viewMode === "month") d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setViewDate(d);
  };

  const navigateNext = () => {
    const d = new Date(viewDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setViewDate(d);
  };

  const jumpToToday = () => {
    setViewDate(today);
    setSelectedDate(today);
  };

  const isViewingToday =
    viewMode === "month"
      ? viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear()
      : getWeekDays(viewDate).some((d) => isSameDay(d, today));

  const updateEvents = (updated: ScheduleEvent[]) => {
    setEvents(updated);
    saveEvents(updated);
  };

  const handleSaveEvent = (event: ScheduleEvent) => {
    if (editingEvent) {
      updateEvents(events.map((e) => (e.id === event.id ? event : e)));
    } else {
      updateEvents([...events, event]);
    }
    setShowAddSheet(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    updateEvents(events.filter((e) => e.id !== id));
  };

  const openEditSheet = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setShowAddSheet(true);
  };

  const openAddSheet = () => {
    setEditingEvent(null);
    setShowAddSheet(true);
  };

  const selectDate = (d: Date) => {
    setSelectedDate(d);
    setViewDate(d);
  };

  // ─── Month heading ───────
  const monthLabel =
    viewMode === "month"
      ? `${t(`month.${viewDate.getMonth()}`)} ${viewDate.getFullYear()}`
      : viewMode === "week"
      ? (() => {
          const wk = getWeekDays(viewDate);
          const first = wk[0];
          const last = wk[6];
          if (first.getMonth() === last.getMonth()) {
            return `${t(`month.${first.getMonth()}`)} ${first.getDate()}–${last.getDate()}, ${first.getFullYear()}`;
          }
          return `${t(`month.${first.getMonth()}`).slice(0, 3)} ${first.getDate()} – ${t(`month.${last.getMonth()}`).slice(0, 3)} ${last.getDate()}`;
        })()
      : (() => {
          const d = selectedDate;
          return `${t(WEEKDAY_KEYS[d.getDay()])}, ${t(`month.${d.getMonth()}`)} ${d.getDate()}`;
        })();

  if (!mounted) return null;

  return (
    <div className="h-[100dvh] overflow-y-auto bg-cream-50 pt-24 px-4 pb-28">
      <div className="max-w-md mx-auto space-y-4">

        {/* ── View mode toggle ── */}
        <div className="glass-heavy rounded-2xl p-1.5 flex gap-1">
          {(["month", "week", "day"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                viewMode === mode
                  ? "bg-teal text-white shadow-sm"
                  : "text-navy/50 active:bg-white/30"
              }`}
            >
              {t(`schedule.${mode}`)}
            </button>
          ))}
        </div>

        {/* ── Navigation header ── */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={navigatePrev}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-navy/60 active:bg-white/40 transition-colors"
          >
            <ChevronLeft />
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-navy">{monthLabel}</h2>
            {!isViewingToday && (
              <button
                onClick={jumpToToday}
                className="text-xs font-bold text-teal bg-teal/10 px-2.5 py-1 rounded-full active:scale-95 transition-transform"
              >
                {t("schedule.today")}
              </button>
            )}
          </div>

          <button
            onClick={navigateNext}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-navy/60 active:bg-white/40 transition-colors"
          >
            <ChevronRight />
          </button>
        </div>

        {/* ── Calendar views ── */}
        {viewMode === "month" && (
          <MonthView
            viewDate={viewDate}
            selectedDate={selectedDate}
            today={today}
            eventDatesSet={eventDatesSet}
            eventsForDate={eventsForDate}
            onSelectDate={selectDate}
          />
        )}

        {viewMode === "week" && (
          <WeekView
            viewDate={viewDate}
            selectedDate={selectedDate}
            today={today}
            eventsForDate={eventsForDate}
            onSelectDate={selectDate}
          />
        )}

        {viewMode === "day" && (
          <DayView events={selectedEvents} />
        )}

        {/* ── Event list (month & week views) ── */}
        {viewMode !== "day" && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-navy/50 px-1">
              {selectedDateStr === todayStr
                ? t("schedule.todaySchedule")
                : `${t(WEEKDAY_KEYS[selectedDate.getDay()])}, ${t(`month.${selectedDate.getMonth()}`).slice(0, 3)} ${selectedDate.getDate()}`}
            </h3>
            {selectedEvents.length === 0 ? (
              <div className="glass-heavy rounded-2xl p-8 text-center">
                <p className="text-navy/40 text-sm font-semibold">{t("schedule.noEvents")}</p>
                {isCaretaker && (
                  <button
                    onClick={openAddSheet}
                    className="mt-3 text-teal text-sm font-bold active:scale-95 transition-transform"
                  >
                    {t("schedule.addOne")}
                  </button>
                )}
              </div>
            ) : (
              selectedEvents.map((evt) => (
                <EventCard
                  key={evt.id}
                  event={evt}
                  isCaretaker={isCaretaker}
                  onEdit={() => openEditSheet(evt)}
                  onDelete={() => handleDeleteEvent(evt.id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── FAB add button (caretaker only) ── */}
      {isCaretaker && (
        <button
          onClick={openAddSheet}
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-teal text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40"
          aria-label="Add event"
        >
          <PlusIcon />
        </button>
      )}

      {/* ── Add/Edit event bottom sheet ── */}
      {showAddSheet && (
        <AddEventSheet
          selectedDate={selectedDate}
          editingEvent={editingEvent}
          onClose={() => { setShowAddSheet(false); setEditingEvent(null); }}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
}

// ─── Month View ──────────────────────────────────────────
function MonthView({
  viewDate,
  selectedDate,
  today,
  eventDatesSet,
  eventsForDate,
  onSelectDate,
}: {
  viewDate: Date;
  selectedDate: Date;
  today: Date;
  eventDatesSet: Set<string>;
  eventsForDate: (dateStr: string) => ScheduleEvent[];
  onSelectDate: (d: Date) => void;
}) {
  const { t } = useLanguage();
  const cells = getMonthDays(viewDate.getFullYear(), viewDate.getMonth());
  const todayStr = toDateStr(today);
  const selectedStr = toDateStr(selectedDate);

  return (
    <div className="glass-heavy rounded-2xl p-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_KEYS.map((key) => (
          <div key={key} className="text-center text-xs font-bold text-navy/40 py-1">
            {t(key)}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="aspect-square" />;

          const dateStr = toDateStr(date);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedStr;
          const hasEvents = eventDatesSet.has(dateStr);
          const dayEvents = hasEvents ? eventsForDate(dateStr) : [];
          const isCurrentMonth = date.getMonth() === viewDate.getMonth();

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(date)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 relative ${
                isSelected
                  ? "bg-teal text-white shadow-sm"
                  : isToday
                  ? "bg-teal/15 text-teal"
                  : isCurrentMonth
                  ? "text-navy hover:bg-white/40"
                  : "text-navy/25"
              }`}
            >
              <span className={`text-sm font-bold leading-none ${isSelected ? "text-white" : ""}`}>
                {date.getDate()}
              </span>
              {/* Event dots */}
              {hasEvents && (
                <div className="flex gap-0.5">
                  {dayEvents.slice(0, 3).map((evt, j) => (
                    <span
                      key={j}
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? "bg-white/70" : TYPE_COLORS[evt.type]
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ───────────────────────────────────────────
function WeekView({
  viewDate,
  selectedDate,
  today,
  eventsForDate,
  onSelectDate,
}: {
  viewDate: Date;
  selectedDate: Date;
  today: Date;
  eventsForDate: (dateStr: string) => ScheduleEvent[];
  onSelectDate: (d: Date) => void;
}) {
  const { t } = useLanguage();
  const weekDays = getWeekDays(viewDate);
  const todayStr = toDateStr(today);
  const selectedStr = toDateStr(selectedDate);

  return (
    <div className="glass-heavy rounded-2xl p-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date) => {
          const dateStr = toDateStr(date);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedStr;
          const dayEvents = eventsForDate(dateStr);
          const count = dayEvents.length;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-90 ${
                isSelected
                  ? "bg-teal text-white shadow-sm"
                  : isToday
                  ? "bg-teal/15 text-teal"
                  : "text-navy hover:bg-white/40"
              }`}
            >
              <span className={`text-[10px] font-bold uppercase ${isSelected ? "text-white/70" : "text-navy/40"}`}>
                {t(WEEKDAY_KEYS[date.getDay()])}
              </span>
              <span className="text-lg font-bold leading-none">{date.getDate()}</span>
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  isSelected ? "bg-white/25 text-white" : "bg-navy/8 text-navy/50"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Day View (Timeline) ────────────────────────────────
function DayView({ events }: { events: ScheduleEvent[] }) {
  const { t } = useLanguage();
  return (
    <div className="glass-heavy rounded-2xl p-4">
      <div className="relative" style={{ height: HOURS.length * 60 }}>
        {/* Hour lines */}
        {HOURS.map((hour) => {
          const top = (hour - HOURS[0]) * 60;
          return (
            <div key={hour} className="absolute left-0 right-0" style={{ top }}>
              <div className="flex items-start">
                <span className="text-[10px] font-bold text-navy/30 w-12 shrink-0 -mt-1.5 text-right pr-3">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </span>
                <div className="flex-1 border-t border-navy/8" />
              </div>
            </div>
          );
        })}

        {/* Event blocks */}
        {events.map((evt) => {
          const hour = parseTimeToHour(evt.time);
          const top = (hour - HOURS[0]) * 60;
          return (
            <div
              key={evt.id}
              className={`absolute left-14 right-2 rounded-xl px-3 py-2 border-l-[3px] ${TYPE_BORDER_COLORS[evt.type]}`}
              style={{
                top: Math.max(top, 0),
                minHeight: 48,
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p className="text-sm font-bold text-navy leading-tight">{evt.title}</p>
              <p className="text-xs text-navy/50 font-semibold">{evt.time}</p>
              {evt.notes && <p className="text-xs text-navy/40 mt-0.5">{evt.notes}</p>}
            </div>
          );
        })}

        {/* Empty state */}
        {events.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-navy/30 text-sm font-semibold">{t("schedule.nothingScheduled")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Event Card ──────────────────────────────────────────
function EventCard({
  event,
  isCaretaker,
  onEdit,
  onDelete,
}: {
  event: ScheduleEvent;
  isCaretaker: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`glass-heavy rounded-2xl px-4 py-3.5 border-l-[3px] ${TYPE_BORDER_COLORS[event.type]} flex items-center gap-3`}
    >
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${TYPE_COLORS[event.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-navy leading-tight truncate">{event.title}</p>
        {event.notes && (
          <p className="text-xs text-navy/40 truncate mt-0.5">{event.notes}</p>
        )}
      </div>
      <span className="text-xs font-bold text-navy/40 shrink-0">{event.time}</span>
      {isCaretaker && (
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-navy/30 hover:text-navy/60 active:scale-90 transition-all"
          >
            <EditIcon />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-navy/30 hover:text-warm-pink active:scale-90 transition-all"
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Add/Edit Event Sheet ────────────────────────────────
function parseTimeFields(time: string): { hour: string; minute: string; ampm: string } {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: "9", minute: "00", ampm: "AM" };
  return { hour: match[1], minute: match[2], ampm: match[3].toUpperCase() };
}

function AddEventSheet({
  selectedDate,
  editingEvent,
  onClose,
  onSave,
}: {
  selectedDate: Date;
  editingEvent: ScheduleEvent | null;
  onClose: () => void;
  onSave: (event: ScheduleEvent) => void;
}) {
  const { t } = useLanguage();
  const isEditing = !!editingEvent;
  const parsedTime = editingEvent ? parseTimeFields(editingEvent.time) : null;

  const [title, setTitle] = useState(editingEvent?.title ?? "");
  const [date, setDate] = useState(editingEvent?.date ?? toDateStr(selectedDate));
  const [hour, setHour] = useState(parsedTime?.hour ?? "9");
  const [minute, setMinute] = useState(parsedTime?.minute ?? "00");
  const [ampm, setAmpm] = useState(parsedTime?.ampm ?? "AM");
  const [type, setType] = useState<EventType>(editingEvent?.type ?? "routine");
  const [notes, setNotes] = useState(editingEvent?.notes ?? "");

  const handleSave = () => {
    if (!title.trim()) return;
    const timeStr = `${hour}:${minute} ${ampm}`;
    onSave({
      id: editingEvent?.id ?? `evt-${Date.now()}`,
      title: title.trim(),
      time: timeStr,
      type,
      date,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 animate-[fade-in-up_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-[fade-in-up_0.3s_ease-out]">
        <div className="glass-heavy rounded-t-3xl px-6 pt-5 pb-8 max-w-md mx-auto safe-bottom"
          style={{ background: "rgba(255,248,240,0.95)", backdropFilter: "blur(30px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-navy">
              {isEditing ? (t("schedule.editEvent") ?? "Edit Event") : t("schedule.newEvent")}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-navy/40 active:bg-navy/10 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-navy/50 mb-1.5 block">{t("schedule.title")}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("schedule.titlePlaceholder")}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-navy/10 text-sm font-semibold text-navy placeholder:text-navy/30 outline-none focus:border-teal transition-colors"
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-xs font-bold text-navy/50 mb-1.5 block">{t("schedule.date")}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-navy/10 text-sm font-semibold text-navy outline-none focus:border-teal transition-colors"
              />
            </div>

            {/* Time */}
            <div>
              <label className="text-xs font-bold text-navy/50 mb-1.5 block">{t("schedule.time")}</label>
              <div className="flex gap-2">
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl bg-white/60 border border-navy/10 text-sm font-semibold text-navy outline-none focus:border-teal"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl bg-white/60 border border-navy/10 text-sm font-semibold text-navy outline-none focus:border-teal"
                >
                  {["00", "15", "30", "45"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={ampm}
                  onChange={(e) => setAmpm(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl bg-white/60 border border-navy/10 text-sm font-semibold text-navy outline-none focus:border-teal"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-bold text-navy/50 mb-1.5 block">{t("schedule.type")}</label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(TYPE_LABEL_KEYS) as EventType[]).map((tp) => (
                  <button
                    key={tp}
                    onClick={() => setType(tp)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      type === tp
                        ? `${TYPE_COLORS[tp]} text-white shadow-sm`
                        : "bg-white/50 text-navy/50 border border-navy/10"
                    }`}
                  >
                    {t(TYPE_LABEL_KEYS[tp])}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-navy/50 mb-1.5 block">{t("schedule.notes")} <span className="font-normal text-navy/30">{t("schedule.notesOptional")}</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("schedule.notesPlaceholder")}
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-navy/10 text-sm font-semibold text-navy placeholder:text-navy/30 outline-none focus:border-teal transition-colors resize-none"
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className={`w-full py-3.5 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.98] ${
                title.trim() ? "bg-teal shadow-sm" : "bg-navy/20"
              }`}
            >
              {isEditing ? (t("schedule.save") ?? "Save") : t("schedule.save")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
