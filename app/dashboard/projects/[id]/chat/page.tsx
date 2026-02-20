"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/lib/project-context";
import { useChat } from "@/lib/chat-context";
import { useSession } from "next-auth/react";
import {
  Send,
  Bot,
  CheckCircle2,
  MessageSquareText,
  Brain,
  ListChecks,
  UsersRound,
  Sparkles,
  X,
  Check,
  Trash2,
  Link2,
  TrendingUp,
  Loader2,
  Zap,
  ShieldAlert,
  HelpCircle,
  Handshake,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { ExtractedTask, TaskStatus } from "@/lib/chat-types";

type RightPanel = "decisions" | "highlights" | "tasks" | "members" | null;

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: "To Do", color: "text-gray-600", bg: "bg-gray-100" },
  "in-progress": { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50" },
  review: { label: "Review", color: "text-amber-700", bg: "bg-amber-50" },
  done: { label: "Done", color: "text-emerald-700", bg: "bg-emerald-50" },
};

const PRIORITY_CONFIG: Record<string, { dot: string }> = {
  critical: { dot: "bg-red-500" },
  high: { dot: "bg-orange-500" },
  medium: { dot: "bg-yellow-500" },
  low: { dot: "bg-green-500" },
};

const HIGHLIGHT_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  resolved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  agreed: { icon: Handshake, color: "text-blue-600", bg: "bg-blue-50" },
  pending_question: { icon: HelpCircle, color: "text-amber-600", bg: "bg-amber-50" },
  blocker: { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" },
};

export default function SmartChatPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject } = useProjects();
  const { data: session } = useSession();
  const project = getProject(projectId);
  const {
    messages,
    decisions,
    highlights,
    extractedTasks,
    memberProgress,
    sendMessage,
    confirmTask,
    dismissTask,
    updateTaskStatus,
    aiProcessing,
  } = useChat();

  const [input, setInput] = useState("");
  const [activePanel, setActivePanel] = useState<RightPanel>("tasks");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userName = session?.user?.name || "You";
  const userAvatar = session?.user?.name?.[0] || "U";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(projectId, input.trim(), userName, userAvatar);
    setInput("");
    inputRef.current?.focus();
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const formatRelative = useCallback((iso: string) => {
    const diff = performance.now() - (performance.now() - (Date.now() - new Date(iso).getTime()));
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }, []);

  const pendingTasks = extractedTasks.filter((t) => !t.confirmedAt);
  const confirmedTasks = extractedTasks.filter((t) => t.confirmedAt);

  // ── Panel sidebar buttons ──────────────────────────────

  const panelButtons: { key: RightPanel; icon: React.ElementType; label: string; count: number }[] = [
    { key: "decisions", icon: Brain, label: "Decisions", count: decisions.length },
    { key: "highlights", icon: Sparkles, label: "Highlights", count: highlights.length },
    { key: "tasks", icon: ListChecks, label: "Tasks", count: extractedTasks.length },
    { key: "members", icon: UsersRound, label: "Members", count: memberProgress.length },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 -m-6">
      {/* ════════════════════════════════════════════════════
          MAIN CHAT AREA
         ════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquareText className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {project?.name || "Project"} Chat
              </h2>
              <p className="text-[11px] text-muted">
                {messages.length} messages · {extractedTasks.length} tasks extracted ·{" "}
                {decisions.length} decisions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {aiProcessing && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 text-[11px] font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                AI analyzing…
              </span>
            )}
            <div className="flex -space-x-2 ml-2">
              {memberProgress.filter((m) => m.isActive).map((m) => (
                <div
                  key={m.memberId}
                  className="w-7 h-7 rounded-full bg-primary-light border-2 border-white flex items-center justify-center"
                  title={m.memberName}
                >
                  <span className="text-[9px] font-bold text-primary">{m.avatar}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
          {messages.map((msg) => {
            const isAI = msg.role === "ai";
            const showAvatar = true;

            return (
              <div key={msg.id} className={`${showAvatar ? "mt-4" : "mt-0.5"}`}>
                {showAvatar && (
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isAI
                          ? "bg-violet-100 text-violet-700"
                          : "bg-primary-light text-primary"
                      }`}
                    >
                      {isAI ? (
                        <Bot className="w-3.5 h-3.5" />
                      ) : (
                        msg.senderAvatar || msg.senderName[0]
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${isAI ? "text-violet-700" : "text-foreground"}`}>
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-muted">{formatTime(msg.timestamp)}</span>
                  </div>
                )}
                <div className={`ml-9 ${isAI ? "pl-3 border-l-2 border-violet-200" : ""}`}>
                  <p
                    className={`text-sm leading-relaxed ${
                      isAI ? "text-violet-900 bg-violet-50/50 rounded-lg px-3 py-2" : "text-foreground"
                    }`}
                  >
                    {msg.content}
                  </p>
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {Object.entries(msg.reactions).map(([emoji, users]) => (
                        <span
                          key={emoji}
                          className="px-1.5 py-0.5 rounded-full bg-gray-100 text-xs"
                        >
                          {emoji} {users.length}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {aiProcessing && (
            <div className="mt-4 ml-9 pl-3 border-l-2 border-violet-200">
              <div className="flex items-center gap-2 text-sm text-violet-600 bg-violet-50/50 rounded-lg px-3 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing message for tasks, decisions &amp; context…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Pending Task Confirmations */}
        {pendingTasks.length > 0 && (
          <div className="px-6 py-2 border-t border-border bg-amber-50/50">
            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-2">
              <Zap className="w-3 h-3 inline mr-1" />
              {pendingTasks.length} task{pendingTasks.length > 1 ? "s" : ""} awaiting confirmation
            </p>
            <div className="space-y-1.5">
              {pendingTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-amber-200"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[task.priority]?.dot}`} />
                  <span className="text-xs text-foreground flex-1 truncate">{task.title}</span>
                  <span className="text-[10px] text-muted">→ {task.suggestedAssignee}</span>
                  <button
                    onClick={() => confirmTask(task.id)}
                    className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
                    title="Confirm task"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => dismissTask(task.id)}
                    className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-4 border-t border-border bg-white">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-border rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message — AI will detect tasks & decisions automatically…"
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted"
              />
              <kbd className="hidden lg:inline px-1.5 py-0.5 rounded bg-white border border-border text-[9px] text-muted font-mono">
                Enter
              </kbd>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-muted mt-1.5 ml-1">
            <Bot className="w-3 h-3 inline mr-1" />
            AI auto-detects: tasks, decisions, blockers &amp; duplicates
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          PANEL TOGGLE BAR
         ════════════════════════════════════════════════════ */}
      <div className="w-12 bg-white border-r border-border flex flex-col items-center py-3 gap-1">
        {panelButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = activePanel === btn.key;
          return (
            <button
              key={btn.key}
              onClick={() => setActivePanel(isActive ? null : btn.key)}
              className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:text-foreground hover:bg-gray-50"
              }`}
              title={btn.label}
            >
              <Icon className="w-4 h-4" />
              {btn.count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center">
                  {btn.count > 9 ? "9+" : btn.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════
          RIGHT INTELLIGENCE PANEL
         ════════════════════════════════════════════════════ */}
      {activePanel && (
        <div className="w-85 bg-white flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground capitalize flex items-center gap-2">
              {panelButtons.find((b) => b.key === activePanel)?.label}
              <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-muted">
                {panelButtons.find((b) => b.key === activePanel)?.count}
              </span>
            </h3>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-lg hover:bg-gray-100 text-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* ── Decisions Panel ── */}
            {activePanel === "decisions" &&
              decisions.map((dec) => (
                <div
                  key={dec.id}
                  className="bg-gray-50 rounded-xl p-4 border border-border space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm font-medium text-foreground leading-snug">{dec.summary}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        dec.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {dec.status}
                    </span>
                    {dec.relatedModule && (
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-muted">
                        {dec.relatedModule}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {dec.participants.map((p) => (
                      <span key={p} className="text-[10px] text-muted bg-white px-1.5 py-0.5 rounded border border-border">
                        {p}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted">{formatRelative(dec.timestamp)}</p>
                </div>
              ))}

            {/* ── Highlights Panel ── */}
            {activePanel === "highlights" &&
              highlights.map((hl) => {
                const cfg = HIGHLIGHT_ICONS[hl.type] || HIGHLIGHT_ICONS.resolved;
                const Icon = cfg.icon;
                return (
                  <div
                    key={hl.id}
                    className="bg-gray-50 rounded-xl p-4 border border-border space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-0.5">
                          {hl.type.replace("_", " ")}
                        </p>
                        <p className="text-sm text-foreground leading-snug">{hl.summary}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted ml-8">{formatRelative(hl.timestamp)}</p>
                  </div>
                );
              })}

            {/* ── Tasks Panel ── */}
            {activePanel === "tasks" && (
              <>
                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-3 border border-border">
                    <p className="text-lg font-bold text-foreground">{confirmedTasks.length}</p>
                    <p className="text-[10px] text-muted">Confirmed</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <p className="text-lg font-bold text-amber-700">{pendingTasks.length}</p>
                    <p className="text-[10px] text-amber-600">Pending</p>
                  </div>
                </div>

                {extractedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onConfirm={confirmTask}
                    onDismiss={dismissTask}
                    onStatusChange={updateTaskStatus}
                    formatRelative={formatRelative}
                  />
                ))}
              </>
            )}

            {/* ── Members Panel ── */}
            {activePanel === "members" && (
              <>
                {memberProgress.map((m) => (
                  <div
                    key={m.memberId}
                    className="bg-gray-50 rounded-xl p-4 border border-border"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{m.avatar}</span>
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-50 ${
                            m.isActive ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{m.memberName}</p>
                        <p className="text-[10px] text-muted">
                          {m.isActive ? "Active now" : `Last seen ${formatRelative(m.lastActive)}`}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary">{m.completionPct}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-gray-200 rounded-full mb-2">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${m.completionPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs font-bold text-foreground">{m.assignedTasks}</p>
                        <p className="text-[9px] text-muted">Assigned</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-600">{m.inProgressTasks}</p>
                        <p className="text-[9px] text-muted">Active</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-600">{m.completedTasks}</p>
                        <p className="text-[9px] text-muted">Done</p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted">{m.contributions} messages</span>
                      <span className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        View activity
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Task Card Component ────────────────────────────────────

function TaskCard({
  task,
  onConfirm,
  onDismiss,
  onStatusChange,
  formatRelative,
}: {
  task: ExtractedTask;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  formatRelative: (iso: string) => string;
}) {
  const isPending = !task.confirmedAt;
  const cfg = STATUS_CONFIG[task.status];

  return (
    <div
      className={`rounded-xl p-4 border space-y-2 ${
        isPending ? "bg-amber-50/50 border-amber-200" : "bg-gray-50 border-border"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_CONFIG[task.priority]?.dot}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">{task.title}</p>
          <p className="text-[10px] text-muted mt-0.5 truncate italic">&ldquo;{task.sourceText}&rdquo;</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {task.suggestedAssignee && (
          <span className="flex items-center gap-1 text-[10px] text-muted bg-white px-1.5 py-0.5 rounded border border-border">
            <UsersRound className="w-2.5 h-2.5" />
            {task.suggestedAssignee}
          </span>
        )}
        {!isPending && (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border-0 ${cfg.bg} ${cfg.color} outline-none`}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        )}
        {isPending && (
          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
            Awaiting confirmation
          </span>
        )}
        {task.duplicateOf && (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-medium">
            <Link2 className="w-2.5 h-2.5" />
            Duplicate
          </span>
        )}
      </div>

      {isPending && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onConfirm(task.id)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Check className="w-3 h-3" />
            Confirm
          </button>
          <button
            onClick={() => onDismiss(task.id)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white text-muted border border-border text-xs font-medium hover:text-red-500 hover:border-red-200 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Dismiss
          </button>
        </div>
      )}

      <p className="text-[10px] text-muted">{formatRelative(task.createdAt)}</p>
    </div>
  );
}
