"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/lib/project-context";
import { CalendarEvent, EventCategory, EventColor } from "@/lib/types";
import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Video,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Settings,
  Clock,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";

/* ─── Helpers ─── */
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EVENT_COLORS: Record<EventColor, { bg: string; border: string; text: string }> = {
  blue:   { bg: "bg-blue-50", border: "border-l-blue-500", text: "text-blue-700" },
  green:  { bg: "bg-emerald-50", border: "border-l-emerald-500", text: "text-emerald-700" },
  red:    { bg: "bg-red-50", border: "border-l-red-500", text: "text-red-700" },
  amber:  { bg: "bg-amber-50", border: "border-l-amber-500", text: "text-amber-700" },
  purple: { bg: "bg-purple-50", border: "border-l-purple-500", text: "text-purple-700" },
  cyan:   { bg: "bg-cyan-50", border: "border-l-cyan-500", text: "text-cyan-700" },
  pink:   { bg: "bg-pink-50", border: "border-l-pink-500", text: "text-pink-700" },
};

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: "meeting", label: "Meeting" },
  { value: "sprint", label: "Sprint" },
  { value: "deadline", label: "Deadline" },
  { value: "review", label: "Review" },
  { value: "deployment", label: "Deployment" },
  { value: "other", label: "Other" },
];

const COLOR_OPTIONS: EventColor[] = ["blue", "green", "red", "amber", "purple", "cyan", "pink"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday = 0 in our grid
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: { date: Date; inMonth: boolean }[] = [];

  // Previous month fill
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, inMonth: false });
  }
  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), inMonth: true });
  }
  // Next month fill
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), inMonth: false });
    }
  }
  return days;
}

function formatDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(d: Date) {
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

/* ─── Mini Calendar ─── */
function MiniCalendar({
  year,
  month,
  selectedDate,
  onSelect,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const days = getMonthDays(year, month);
  const miniDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {MONTHS[month]} {year}
        </h3>
        <div className="flex gap-1">
          <button onClick={onPrev} className="p-1 rounded hover:bg-gray-100 text-muted transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={onNext} className="p-1 rounded hover:bg-gray-100 text-muted transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {miniDays.map((d, i) => (
          <span key={i} className="text-[10px] font-semibold text-muted py-1">
            {d}
          </span>
        ))}
        {/* Adjust for Sunday-start mini calendar */}
        {(() => {
          const firstDay = new Date(year, month, 1);
          const lastDay = new Date(year, month + 1, 0);
          const startDow = firstDay.getDay(); // Sunday = 0

          const cells: { date: Date; inMonth: boolean }[] = [];
          for (let i = startDow - 1; i >= 0; i--) {
            cells.push({ date: new Date(year, month, -i), inMonth: false });
          }
          for (let i = 1; i <= lastDay.getDate(); i++) {
            cells.push({ date: new Date(year, month, i), inMonth: true });
          }
          const rem = 7 - (cells.length % 7);
          if (rem < 7) {
            for (let i = 1; i <= rem; i++) {
              cells.push({ date: new Date(year, month + 1, i), inMonth: false });
            }
          }

          return cells.map((cell, i) => {
            const key = formatDateKey(cell.date);
            const today = isToday(cell.date);
            const selected = selectedDate === key;
            return (
              <button
                key={i}
                onClick={() => onSelect(key)}
                className={`w-7 h-7 rounded-full text-[11px] font-medium transition-all ${
                  !cell.inMonth
                    ? "text-gray-300"
                    : selected
                    ? "bg-primary text-white"
                    : today
                    ? "bg-primary-light text-primary font-bold"
                    : "text-foreground hover:bg-gray-100"
                }`}
              >
                {cell.date.getDate()}
              </button>
            );
          });
        })()}
      </div>
    </div>
  );
}

/* ─── Create Event Modal ─── */
function CreateEventModal({
  projectId,
  initialDate,
  onClose,
}: {
  projectId: string;
  initialDate?: string;
  onClose: () => void;
}) {
  const { addEvent } = useProjects();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(initialDate || new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<EventCategory>("meeting");
  const [color, setColor] = useState<EventColor>("blue");
  const [description, setDescription] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    if (!title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }
    addEvent({
      projectId,
      title: title.trim(),
      date,
      time: time || undefined,
      endTime: endTime || undefined,
      category,
      color,
      description: description.trim() || undefined,
      meetingLink: meetingLink.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Create Event</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              placeholder="e.g. Sprint Planning, Client Demo..."
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors({}); }}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                errors.title ? "border-red-400" : "border-border"
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCategory(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    category === opt.value
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted border-border hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Color
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => {
                const colorMap: Record<EventColor, string> = {
                  blue: "bg-blue-500",
                  green: "bg-emerald-500",
                  red: "bg-red-500",
                  amber: "bg-amber-500",
                  purple: "bg-purple-500",
                  cyan: "bg-cyan-500",
                  pink: "bg-pink-500",
                };
                return (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full ${colorMap[c]} transition-all ${
                      color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Meeting Link{" "}
              <span className="text-muted/60 normal-case font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="url"
                placeholder="https://meet.google.com/abc-defg-hij"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Description{" "}
              <span className="text-muted/60 normal-case font-normal">(Optional)</span>
            </label>
            <textarea
              placeholder="Add notes, agenda, or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted border border-border hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Event Detail Popup ─── */
function EventDetail({
  event,
  onClose,
  onDelete,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onDelete: () => void;
}) {
  const colors = EVENT_COLORS[event.color];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{event.title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock className="w-4 h-4" />
            <span>{event.date}</span>
            {event.time && (
              <>
                <span>·</span>
                <span>
                  {event.time}
                  {event.endTime ? ` – ${event.endTime}` : ""}
                </span>
              </>
            )}
          </div>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors.bg} ${colors.text}`}>
              {event.category}
            </span>
            {event.riskLevel && (
              <span className={`ml-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                event.riskLevel === "high"
                  ? "bg-red-50 text-red-700"
                  : event.riskLevel === "medium"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}>
                {event.riskLevel} risk
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-sm text-muted leading-relaxed">{event.description}</p>
          )}
          {event.meetingLink && (
            <a
              href={event.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-light text-primary text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <Video className="w-4 h-4" />
              Join Meeting
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <button
            onClick={onDelete}
            className="px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Delete Event
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Calendar Page ─── */
export default function CalendarPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject, getProjectEvents, deleteEvent } = useProjects();
  const project = getProject(projectId);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState<"Month" | "Week" | "List">("Month");
  const [showCreate, setShowCreate] = useState(false);
  const [createDate, setCreateDate] = useState<string | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const events = getProjectEvents(projectId);

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  // Risk categorization
  const riskCounts = useMemo(() => {
    let high = 0, medium = 0, low = 0;
    events.forEach((e) => {
      if (e.riskLevel === "high") high++;
      else if (e.riskLevel === "medium") medium++;
      else low++;
    });
    return { high, medium, low };
  }, [events]);

  // Upcoming meetings (within 7 days)
  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    const week = new Date(now.getTime() + 7 * 86400000);
    return events
      .filter((e) => {
        const d = new Date(e.date);
        return d >= now && d <= week && e.meetingLink;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  const handlePrevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const handleNextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };
  const handleToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  if (!project) return <div className="p-10 text-muted">Project not found.</div>;

  return (
    <div className="flex gap-6 min-h-[calc(100vh-4rem)]">
      {/* ── Left Sidebar ── */}
      <div className="w-[220px] flex-shrink-0 space-y-6">
        {/* Create button */}
        <button
          onClick={() => { setCreateDate(undefined); setShowCreate(true); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>

        {/* Mini Calendar */}
        <MiniCalendar
          year={year}
          month={month}
          selectedDate={selectedDate}
          onSelect={(d) => setSelectedDate(d === selectedDate ? null : d)}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />

        {/* Risk Factors */}
        <div>
          <h4 className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
            Risk Factors
          </h4>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded bg-red-100 flex items-center justify-center">
                <CheckSquare className="w-3 h-3 text-red-600" />
              </div>
              <span className="text-sm text-foreground flex-1">High Risk</span>
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {riskCounts.high > 0 && <span className="w-2 h-2 rounded-full bg-amber-400" />}
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded bg-amber-100 flex items-center justify-center">
                <CheckSquare className="w-3 h-3 text-amber-600" />
              </div>
              <span className="text-sm text-foreground flex-1">Medium Risk</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center">
                <CheckSquare className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="text-sm text-foreground flex-1">On Track</span>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              AI Insight
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            <span className="font-semibold">Heads up:</span>{" "}
            {upcomingMeetings.length > 0
              ? `${upcomingMeetings.length} meeting${upcomingMeetings.length > 1 ? "s" : ""} scheduled this week. Check your meeting links are set correctly.`
              : "No upcoming meetings this week. Consider scheduling a sync with your team."}
          </p>
          <button className="text-xs font-semibold text-primary flex items-center gap-1 hover:text-primary-hover transition-colors">
            View Details <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Team Members */}
        <div>
          <h4 className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
            Team Members
          </h4>
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {project.teamMembers.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="w-8 h-8 rounded-full bg-primary-light border-2 border-white flex items-center justify-center"
                  title={m.name}
                >
                  <span className="text-[10px] font-semibold text-primary">
                    {m.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
              ))}
            </div>
            {project.teamMembers.length > 3 && (
              <span className="ml-2 text-xs text-muted font-medium">
                +{project.teamMembers.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Calendar Grid ── */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            {/* View toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {(["Month", "Week", "List"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    view === v
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <h2 className="text-xl font-bold text-foreground">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex gap-1">
              <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-gray-50 transition-colors">
              <Settings className="w-3.5 h-3.5" />
              View Settings
            </button>
          </div>
        </div>

        {/* Month View */}
        {view === "Month" && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {DAYS.map((d) => (
                <div key={d} className="px-3 py-2.5 text-[11px] font-semibold text-primary uppercase tracking-wider text-center border-r border-border last:border-r-0">
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {Array.from({ length: monthDays.length / 7 }, (_, week) => (
              <div key={week} className="grid grid-cols-7 border-b border-border last:border-b-0">
                {monthDays.slice(week * 7, week * 7 + 7).map((cell, dayIdx) => {
                  const dateKey = formatDateKey(cell.date);
                  const dayEvents = eventsByDate[dateKey] || [];
                  const isTodayCell = isToday(cell.date);
                  const isSelected = selectedDate === dateKey;
                  const MAX_VISIBLE = 2;

                  return (
                    <div
                      key={dayIdx}
                      onClick={() => {
                        setCreateDate(dateKey);
                        setShowCreate(true);
                      }}
                      className={`min-h-[110px] px-2 py-1.5 border-r border-border last:border-r-0 cursor-pointer transition-colors ${
                        !cell.inMonth ? "bg-gray-50/50" : isSelected ? "bg-primary-light/40" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                            isTodayCell
                              ? "bg-primary text-white"
                              : !cell.inMonth
                              ? "text-gray-300"
                              : "text-foreground"
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>
                      </div>
                      {/* Events */}
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, MAX_VISIBLE).map((ev) => {
                          const colors = EVENT_COLORS[ev.color];
                          return (
                            <button
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                              }}
                              className={`w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium truncate border-l-2 ${colors.bg} ${colors.border} ${colors.text} hover:opacity-80 transition-opacity`}
                            >
                              {ev.title}
                              {ev.riskLevel === "high" && (
                                <span className="ml-0.5 inline-block w-1.5 h-1.5 rounded-full bg-red-500 align-middle" />
                              )}
                            </button>
                          );
                        })}
                        {dayEvents.length > MAX_VISIBLE && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(dateKey);
                            }}
                            className="text-[10px] text-muted font-medium hover:text-foreground transition-colors pl-1.5"
                          >
                            +{dayEvents.length - MAX_VISIBLE} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {view === "List" && (
          <div className="bg-white rounded-2xl border border-border">
            <div className="divide-y divide-border">
              {events
                .filter((e) => {
                  const d = new Date(e.date);
                  return d.getMonth() === month && d.getFullYear() === year;
                })
                .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
                .map((ev) => {
                  const colors = EVENT_COLORS[ev.color];
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-3 h-3 rounded-full ${colors.bg} border-2 ${colors.border}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {ev.title}
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          {ev.time && ` · ${ev.time}`}
                          {ev.endTime && ` – ${ev.endTime}`}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${colors.bg} ${colors.text}`}>
                        {ev.category}
                      </span>
                      {ev.meetingLink && <Video className="w-4 h-4 text-muted flex-shrink-0" />}
                    </button>
                  );
                })}
              {events.filter((e) => {
                const d = new Date(e.date);
                return d.getMonth() === month && d.getFullYear() === year;
              }).length === 0 && (
                <div className="py-16 text-center text-sm text-muted">
                  No events this month.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Week View - simplified */}
        {view === "Week" && (
          <div className="bg-white rounded-2xl border border-border p-6">
            <p className="text-sm text-muted text-center py-10">
              Week view coming soon. Use Month or List view.
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CreateEventModal
          projectId={projectId}
          initialDate={createDate}
          onClose={() => setShowCreate(false)}
        />
      )}
      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={() => {
            deleteEvent(selectedEvent.id);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}
