"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/lib/project-context";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Ban,
  Flame,
  TrendingDown,
  GitBranch,
  Bug,
  Zap,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Timer,
  Link2,
  Eye,
  Megaphone,
} from "lucide-react";
import { useState, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────

type RiskLevel = "low" | "medium" | "high" | "critical";
type BlockerStatus = "waiting_review" | "waiting_api" | "merge_conflict" | "unknown_bug" | "design_pending";
type Tab = "overview" | "delays" | "predictions" | "blockers" | "dependencies";

interface DelayItem {
  id: string;
  title: string;
  module: string;
  owner: string;
  ownerAvatar: string;
  riskLevel: RiskLevel;
  description: string;
  inactiveDays: number;
  type: "no_update" | "behind_schedule" | "pr_stale" | "no_commits";
}

interface PredictedDelay {
  id: string;
  title: string;
  expectedDelay: string;
  reason: string;
  module: string;
  riskLevel: RiskLevel;
  confidence: number; // 0-100
  factors: string[];
}

interface HighPriorityTask {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium";
  owner: string;
  ownerAvatar: string;
  dueDate: string;
  daysLeft: number;
  linkedMilestone?: string;
  dependencyCount: number;
  isDemoBlocking: boolean;
}

interface Blocker {
  id: string;
  title: string;
  status: BlockerStatus;
  reportedBy: string;
  reportedByAvatar: string;
  affectedArea: string;
  createdAt: string;
  daysOpen: number;
  description: string;
  assignee?: string;
}

interface DependencyChain {
  id: string;
  name: string;
  status: "on_track" | "at_risk" | "blocked";
  owner: string;
  chain: { name: string; status: "done" | "in_progress" | "blocked" | "not_started" }[];
}

interface SmartAlert {
  id: string;
  message: string;
  severity: RiskLevel;
  timestamp: string;
  category: "overlap" | "unassigned" | "stale" | "overload" | "build_fail";
}

// ─── Seed Data ──────────────────────────────────────────────

const DELAYS: DelayItem[] = [
  { id: "d1", title: "Auth Module", module: "Backend / Auth", owner: "Rahul Sharma", ownerAvatar: "RS", riskLevel: "medium", description: "No commits or PR activity in 72 hours. Last update was a WIP commit on token validation.", inactiveDays: 3, type: "no_update" },
  { id: "d2", title: "Payment Integration", module: "Backend / Payments", owner: "Marcus Li", ownerAvatar: "ML", riskLevel: "high", description: "Feature is 35% complete with deadline in 4 days. Backend API dependency still incomplete.", inactiveDays: 2, type: "behind_schedule" },
  { id: "d3", title: "PR #253 — Redis Caching Layer", module: "Infrastructure", owner: "Priya Patel", ownerAvatar: "PP", riskLevel: "critical", description: "Pull request has been waiting for review for 5 days. 7 unresolved comments and failing CI.", inactiveDays: 5, type: "pr_stale" },
  { id: "d4", title: "Dashboard Analytics Widget", module: "Frontend / Dashboard", owner: "Sarah Chen", ownerAvatar: "SC", riskLevel: "low", description: "No commits on the analytics-widget branch in 48 hours. May be deprioritized.", inactiveDays: 2, type: "no_commits" },
  { id: "d5", title: "User Notification System", module: "Backend / Notifications", owner: "Marcus Li", ownerAvatar: "ML", riskLevel: "high", description: "PR #244 open for 7 days without merge. Branch diverging significantly from main.", inactiveDays: 4, type: "pr_stale" },
  { id: "d6", title: "Database Schema Migration v2", module: "Database", owner: "James Oduro", ownerAvatar: "JO", riskLevel: "medium", description: "Migration scripts incomplete. Dependent features in frontend are blocked.", inactiveDays: 1, type: "behind_schedule" },
];

const PREDICTIONS: PredictedDelay[] = [
  { id: "p1", title: "Payment Integration at Risk", expectedDelay: "2–3 days", reason: "Backend API incomplete + assigned member overloaded with 5 active tasks", module: "Payments", riskLevel: "critical", confidence: 87, factors: ["Backend API incomplete", "Member overloaded (5 tasks)", "High bug count in module (4)", "Deadline: Feb 24"] },
  { id: "p2", title: "Frontend Auth Flow Likely Delayed", expectedDelay: "1–2 days", reason: "Depends on backend token endpoint which is blocked", module: "Auth / Frontend", riskLevel: "high", confidence: 72, factors: ["Dependency on backend auth API", "Cross-team coordination needed", "No PR submitted yet", "Deadline: Feb 25"] },
  { id: "p3", title: "Demo Readiness Behind Schedule", expectedDelay: "3–4 days", reason: "Demo script not started, 3 of 4 features incomplete", module: "Demo Prep", riskLevel: "high", confidence: 65, factors: ["Demo script: 0% complete", "Load testing: not started", "3/4 milestone features pending", "Demo date: Mar 5"] },
  { id: "p4", title: "Redis Integration May Slip", expectedDelay: "1 day", reason: "Failing CI pipeline blocking merge, high code change volume", module: "Infrastructure", riskLevel: "medium", confidence: 58, factors: ["CI failing on integration tests", "891 additions in single PR", "7 unresolved review comments"] },
];

const HIGH_PRIORITY_TASKS: HighPriorityTask[] = [
  { id: "hp1", title: "Fix payment gateway timeout", priority: "critical", owner: "Marcus Li", ownerAvatar: "ML", dueDate: "2026-02-22", daysLeft: 2, linkedMilestone: "Sprint 2", dependencyCount: 3, isDemoBlocking: true },
  { id: "hp2", title: "Complete OAuth2 token refresh", priority: "critical", owner: "Sarah Chen", ownerAvatar: "SC", dueDate: "2026-02-23", daysLeft: 3, linkedMilestone: "Sprint 2", dependencyCount: 2, isDemoBlocking: true },
  { id: "hp3", title: "Resolve Redis connection pool leak", priority: "high", owner: "Priya Patel", ownerAvatar: "PP", dueDate: "2026-02-24", daysLeft: 4, linkedMilestone: "Sprint 2", dependencyCount: 1, isDemoBlocking: false },
  { id: "hp4", title: "Deploy monitoring dashboards", priority: "high", owner: "James Oduro", ownerAvatar: "JO", dueDate: "2026-02-25", daysLeft: 5, linkedMilestone: "Demo Day Prep", dependencyCount: 2, isDemoBlocking: true },
  { id: "hp5", title: "Write API documentation v2", priority: "medium", owner: "Priya Patel", ownerAvatar: "PP", dueDate: "2026-02-27", daysLeft: 7, dependencyCount: 0, isDemoBlocking: false },
  { id: "hp6", title: "Webhook payload validation", priority: "high", owner: "Marcus Li", ownerAvatar: "ML", dueDate: "2026-02-23", daysLeft: 3, linkedMilestone: "Sprint 2", dependencyCount: 1, isDemoBlocking: false },
];

const BLOCKERS: Blocker[] = [
  { id: "b1", title: "Frontend auth blocked on backend token endpoint", status: "waiting_api", reportedBy: "Sarah Chen", reportedByAvatar: "SC", affectedArea: "Frontend", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), daysOpen: 2, description: "Cannot proceed with frontend auth flow until backend exposes the refresh token endpoint. Cross-team dependency.", assignee: "Marcus Li" },
  { id: "b2", title: "Redis caching PR — merge conflicts", status: "merge_conflict", reportedBy: "Priya Patel", reportedByAvatar: "PP", affectedArea: "Infrastructure", createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), daysOpen: 3, description: "PR #253 has conflicts with main after recent schema changes. Needs rebase and conflict resolution." },
  { id: "b3", title: "Intermittent e2e test failure", status: "unknown_bug", reportedBy: "James Oduro", reportedByAvatar: "JO", affectedArea: "CI/CD", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), daysOpen: 5, description: "E2e tests randomly fail on the payment flow. Suspected race condition in test teardown." },
  { id: "b4", title: "Notification webhooks awaiting code review", status: "waiting_review", reportedBy: "Marcus Li", reportedByAvatar: "ML", affectedArea: "Backend", createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), daysOpen: 4, description: "PR #244 has been open for 7 days. Only 1 reviewer assigned, no review submitted yet.", assignee: "Sarah Chen" },
  { id: "b5", title: "Design specs pending for settings page", status: "design_pending", reportedBy: "Sarah Chen", reportedByAvatar: "SC", affectedArea: "Frontend", createdAt: new Date(Date.now() - 86400000).toISOString(), daysOpen: 1, description: "Cannot start settings UI implementation without finalized design mockups." },
];

const DEPENDENCY_CHAINS: DependencyChain[] = [
  {
    id: "dc1", name: "User Authentication Flow", status: "blocked", owner: "Sarah Chen",
    chain: [
      { name: "Database schema update", status: "done" },
      { name: "Backend Auth API", status: "in_progress" },
      { name: "Token refresh endpoint", status: "blocked" },
      { name: "Frontend auth integration", status: "not_started" },
      { name: "E2e auth tests", status: "not_started" },
    ],
  },
  {
    id: "dc2", name: "Payment Processing", status: "at_risk", owner: "Marcus Li",
    chain: [
      { name: "Payment gateway SDK setup", status: "done" },
      { name: "Backend payment API", status: "in_progress" },
      { name: "Webhook handlers", status: "blocked" },
      { name: "Frontend checkout flow", status: "not_started" },
    ],
  },
  {
    id: "dc3", name: "Monitoring & Observability", status: "on_track", owner: "James Oduro",
    chain: [
      { name: "Redis instance provisioning", status: "done" },
      { name: "Grafana dashboard setup", status: "in_progress" },
      { name: "Alert rules configuration", status: "not_started" },
    ],
  },
];

const SMART_ALERTS: SmartAlert[] = [
  { id: "sa1", message: "Marcus Li and Sarah Chen both working on auth-related tasks — potential overlap", severity: "medium", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), category: "overlap" },
  { id: "sa2", message: "Deployment task for staging environment has no assignee", severity: "high", timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), category: "unassigned" },
  { id: "sa3", message: "Critical issue 'e2e test failure' open for 5 days without resolution", severity: "critical", timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), category: "stale" },
  { id: "sa4", message: "Marcus Li has 5 active in-progress tasks — possible overload", severity: "medium", timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), category: "overload" },
  { id: "sa5", message: "CI build failing on main branch for 2 consecutive runs", severity: "critical", timestamp: new Date(Date.now() - 3600000).toISOString(), category: "build_fail" },
  { id: "sa6", message: "No standup notes from Priya Patel in 3 days", severity: "low", timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), category: "stale" },
];

// ─── Config ─────────────────────────────────────────────────

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string; border: string; dot: string }> = {
  low: { label: "Low", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  medium: { label: "Medium", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  high: { label: "High", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  critical: { label: "Critical", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
};

const BLOCKER_CONFIG: Record<BlockerStatus, { label: string; icon: React.ElementType; color: string }> = {
  waiting_review: { label: "Waiting for Review", icon: Eye, color: "text-amber-600" },
  waiting_api: { label: "Waiting for API", icon: Clock, color: "text-blue-600" },
  merge_conflict: { label: "Merge Conflict", icon: GitBranch, color: "text-red-600" },
  unknown_bug: { label: "Unknown Bug", icon: Bug, color: "text-purple-600" },
  design_pending: { label: "Design Pending", icon: Eye, color: "text-pink-600" },
};

const CHAIN_STATUS_DOT: Record<string, string> = {
  done: "bg-emerald-500",
  in_progress: "bg-blue-500",
  blocked: "bg-red-500",
  not_started: "bg-gray-300",
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  high: { label: "High", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  medium: { label: "Medium", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
};

// ─── Component ──────────────────────────────────────────────

export default function RisksDelaysPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject } = useProjects();
  const project = getProject(projectId);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedPrediction, setExpandedPrediction] = useState<string | null>("p1");
  const [expandedChain, setExpandedChain] = useState<string | null>("dc1");

  const formatRelative = useCallback((iso: string) => {
    const now = performance.timeOrigin + performance.now();
    const ms = now - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }, []);

  // ── Risk Score Calculation ──────────────────────────────
  const lowRisks = DELAYS.filter((d) => d.riskLevel === "low").length + SMART_ALERTS.filter((a) => a.severity === "low").length;
  const mediumRisks = DELAYS.filter((d) => d.riskLevel === "medium").length + SMART_ALERTS.filter((a) => a.severity === "medium").length;
  const criticalRisks = DELAYS.filter((d) => d.riskLevel === "critical" || d.riskLevel === "high").length + BLOCKERS.length;
  const riskScore = Math.max(0, 100 - criticalRisks * 12 - mediumRisks * 5 - lowRisks * 1);
  const riskLabel = riskScore >= 70 ? "LOW" : riskScore >= 40 ? "MODERATE" : "HIGH";
  const riskColor = riskScore >= 70 ? "text-emerald-600" : riskScore >= 40 ? "text-amber-600" : "text-red-600";
  const ringColor = riskScore >= 70 ? "#10b981" : riskScore >= 40 ? "#f59e0b" : "#ef4444";

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "delays", label: "Delays" },
    { key: "predictions", label: "Predictions" },
    { key: "blockers", label: "Blockers" },
    { key: "dependencies", label: "Dependencies" },
  ];

  const affectedAreas = [...new Set(BLOCKERS.map((b) => b.affectedArea))];

  return (
    <div className="max-w-350 mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Risks &amp; Delays
          </h1>
          <p className="text-sm text-muted mt-1">
            Proactive risk detection for {project?.name || "this project"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${riskScore >= 70 ? "bg-emerald-50 border-emerald-200" : riskScore >= 40 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
            <span className={`text-xs font-bold uppercase ${riskColor}`}>Project Risk: {riskLabel}</span>
          </div>
        </div>
      </div>

      {/* ══════════ RISK SCORE + QUICK STATS ══════════ */}
      <div className="grid grid-cols-5 gap-3">
        {/* Risk Score Ring */}
        <div className="col-span-1 bg-white rounded-2xl border border-border p-5 flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke={ringColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(riskScore / 100) * 213.6} 213.6`} />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${riskColor}`}>
              {riskScore}
            </span>
          </div>
          <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">Health Score</p>
        </div>

        <QuickStat icon={AlertTriangle} label="Active Delays" value={DELAYS.length} sub={`${DELAYS.filter((d) => d.riskLevel === "critical" || d.riskLevel === "high").length} critical/high`} accent="text-amber-600" />
        <QuickStat icon={Ban} label="Blockers" value={BLOCKERS.length} sub={affectedAreas.map((a) => `${BLOCKERS.filter((b) => b.affectedArea === a).length} ${a}`).join(", ")} accent="text-red-600" />
        <QuickStat icon={TrendingDown} label="Predictions" value={PREDICTIONS.length} sub={`${PREDICTIONS.filter((p) => p.confidence >= 70).length} high confidence`} accent="text-violet-600" />
        <QuickStat icon={Flame} label="High Priority" value={HIGH_PRIORITY_TASKS.filter((t) => t.priority === "critical").length} sub={`${HIGH_PRIORITY_TASKS.filter((t) => t.isDemoBlocking).length} demo-blocking`} accent="text-orange-600" />
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key ? "border-red-500 text-red-600" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          OVERVIEW TAB
         ══════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-5">
          {/* Left — Smart Alerts + Delay summary */}
          <div className="col-span-2 space-y-5">
            {/* Smart Alerts */}
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Megaphone className="w-4 h-4 text-amber-500" />
                Smart Alerts
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">{SMART_ALERTS.length}</span>
              </h3>
              <div className="space-y-2">
                {SMART_ALERTS.map((alert) => {
                  const cfg = RISK_CONFIG[alert.severity];
                  return (
                    <div key={alert.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${cfg.border} ${cfg.bg}`}>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                      <p className={`text-sm flex-1 ${cfg.color}`}>{alert.message}</p>
                      <span className="text-[10px] text-muted shrink-0">{formatRelative(alert.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Delays */}
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-orange-500" />
                Active Delays
              </h3>
              <div className="space-y-2">
                {DELAYS.filter((d) => d.riskLevel === "critical" || d.riskLevel === "high").map((delay) => {
                  const cfg = RISK_CONFIG[delay.riskLevel];
                  return (
                    <div key={delay.id} className="bg-white rounded-xl border border-border p-4 flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <AlertTriangle className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-foreground">{delay.title}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <p className="text-xs text-muted">{delay.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-primary-light flex items-center justify-center">
                              <span className="text-[7px] font-bold text-primary">{delay.ownerAvatar}</span>
                            </div>
                            {delay.owner}
                          </span>
                          <span>·</span>
                          <span className="text-orange-600 font-medium">{delay.inactiveDays}d inactive</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Risk breakdown + High priority */}
          <div className="space-y-4">
            {/* Risk Breakdown */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Risk Breakdown</h3>
              {(["critical", "high", "medium", "low"] as RiskLevel[]).map((level) => {
                const cfg = RISK_CONFIG[level];
                const count =
                  DELAYS.filter((d) => d.riskLevel === level).length +
                  PREDICTIONS.filter((p) => p.riskLevel === level).length;
                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                      <span className="text-xs text-foreground capitalize">{cfg.label} Risks</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Blocker summary */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-500" />
                Active Blockers
              </h3>
              <p className="text-2xl font-bold text-foreground">{BLOCKERS.length}</p>
              {affectedAreas.map((area) => {
                const count = BLOCKERS.filter((b) => b.affectedArea === area).length;
                return (
                  <div key={area} className="flex items-center justify-between text-xs">
                    <span className="text-muted">{area}</span>
                    <span className="font-medium text-foreground">{count} blocker{count > 1 ? "s" : ""}</span>
                  </div>
                );
              })}
            </div>

            {/* High priority quick view */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Critical Tasks
              </h3>
              {HIGH_PRIORITY_TASKS.filter((t) => t.priority === "critical").map((task) => (
                <div key={task.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className="text-xs text-foreground flex-1 truncate">{task.title}</span>
                  <span className={`text-[10px] font-medium ${task.daysLeft <= 2 ? "text-red-600" : "text-muted"}`}>
                    {task.daysLeft}d left
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          DELAYS TAB
         ══════════════════════════════════════════════════ */}
      {activeTab === "delays" && (
        <div className="space-y-3">
          {DELAYS.map((delay) => {
            const cfg = RISK_CONFIG[delay.riskLevel];
            const typeLabel =
              delay.type === "no_update" ? "No updates" :
              delay.type === "behind_schedule" ? "Behind schedule" :
              delay.type === "pr_stale" ? "Stale PR" : "No commits";
            return (
              <div key={delay.id} className={`bg-white rounded-2xl border p-5 ${delay.riskLevel === "critical" ? "border-red-200" : "border-border"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <AlertTriangle className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">{delay.title}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>{cfg.label}</span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[9px] text-muted font-medium">{typeLabel}</span>
                    </div>
                    <p className="text-xs text-muted mb-2">{delay.module}</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{delay.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center">
                          <span className="text-[8px] font-bold text-primary">{delay.ownerAvatar}</span>
                        </div>
                        {delay.owner}
                      </span>
                      <span className="flex items-center gap-1 text-orange-600 font-medium">
                        <Timer className="w-3 h-3" />
                        {delay.inactiveDays} days inactive
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          PREDICTIONS TAB
         ══════════════════════════════════════════════════ */}
      {activeTab === "predictions" && (
        <div className="space-y-3">
          <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-600" />
            <p className="text-sm text-violet-800">
              Predictions are generated using rule-based analysis of deadlines, progress, dependencies, and workload.
            </p>
          </div>

          {PREDICTIONS.map((pred) => {
            const cfg = RISK_CONFIG[pred.riskLevel];
            const isExpanded = expandedPrediction === pred.id;
            return (
              <div key={pred.id} className={`bg-white rounded-2xl border overflow-hidden ${pred.riskLevel === "critical" ? "border-red-200" : "border-border"}`}>
                <button
                  onClick={() => setExpandedPrediction(isExpanded ? null : pred.id)}
                  className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <TrendingDown className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-semibold text-foreground">{pred.title}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-muted">{pred.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-red-600">{pred.expectedDelay}</p>
                    <p className="text-[10px] text-muted">{pred.confidence}% confidence</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted shrink-0 mt-1" />}
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 pl-19 border-t border-border bg-gray-50/30">
                    <div className="pt-3 space-y-2">
                      <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">Contributing Factors</p>
                      {pred.factors.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CircleAlert className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="text-xs text-foreground">{f}</span>
                        </div>
                      ))}
                      {/* Confidence bar */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted">Prediction Confidence</span>
                          <span className="font-semibold text-foreground">{pred.confidence}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-full rounded-full ${pred.confidence >= 70 ? "bg-red-500" : pred.confidence >= 50 ? "bg-amber-500" : "bg-blue-500"}`}
                            style={{ width: `${pred.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          BLOCKERS TAB
         ══════════════════════════════════════════════════ */}
      {activeTab === "blockers" && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{BLOCKERS.length}</p>
              <p className="text-[10px] text-red-600 font-medium">Active Blockers</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{affectedAreas.length}</p>
              <p className="text-[10px] text-amber-600 font-medium">Areas Affected</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-700">{BLOCKERS.reduce((a, b) => a + b.daysOpen, 0)}</p>
              <p className="text-[10px] text-orange-600 font-medium">Total Blocked Days</p>
            </div>
          </div>

          {BLOCKERS.map((blocker) => {
            const bcfg = BLOCKER_CONFIG[blocker.status];
            const BIcon = bcfg.icon;
            return (
              <div key={blocker.id} className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Ban className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground mb-1">{blocker.title}</h4>
                    <p className="text-sm text-muted leading-relaxed mb-3">{blocker.description}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 border border-border text-[10px] font-medium ${bcfg.color}`}>
                        <BIcon className="w-3 h-3" />
                        {bcfg.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <div className="w-4 h-4 rounded-full bg-primary-light flex items-center justify-center">
                          <span className="text-[7px] font-bold text-primary">{blocker.reportedByAvatar}</span>
                        </div>
                        {blocker.reportedBy}
                      </span>
                      <span className="text-xs text-muted">· {blocker.affectedArea}</span>
                      <span className={`text-xs font-medium ${blocker.daysOpen >= 4 ? "text-red-600" : "text-amber-600"}`}>
                        {blocker.daysOpen}d open
                      </span>
                      {blocker.assignee && (
                        <span className="text-xs text-muted">→ {blocker.assignee}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          DEPENDENCIES TAB
         ══════════════════════════════════════════════════ */}
      {activeTab === "dependencies" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              Dependency chains show how bottlenecks propagate through your project.
            </p>
          </div>

          {DEPENDENCY_CHAINS.map((chain) => {
            const isExpanded = expandedChain === chain.id;
            const statusColor = chain.status === "blocked" ? "text-red-700 bg-red-50 border-red-200" : chain.status === "at_risk" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-emerald-700 bg-emerald-50 border-emerald-200";
            const blockedCount = chain.chain.filter((s) => s.status === "blocked").length;
            const doneCount = chain.chain.filter((s) => s.status === "done").length;
            const pct = Math.round((doneCount / chain.chain.length) * 100);

            return (
              <div key={chain.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedChain(isExpanded ? null : chain.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Link2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-semibold text-foreground">{chain.name}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${statusColor}`}>
                        {chain.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{chain.chain.length} steps · {doneCount} done · {blockedCount} blocked · Owner: {chain.owner}</p>
                  </div>
                  <div className="text-right shrink-0 mr-2">
                    <p className="text-sm font-bold text-foreground">{pct}%</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border bg-gray-50/30 pt-4">
                    <div className="space-y-0">
                      {chain.chain.map((step, i) => {
                        const isLast = i === chain.chain.length - 1;
                        const stepLabel =
                          step.status === "done" ? "Complete" :
                          step.status === "in_progress" ? "In Progress" :
                          step.status === "blocked" ? "Blocked" : "Not Started";
                        return (
                          <div key={i} className="flex items-stretch gap-3">
                            {/* Vertical line + dot */}
                            <div className="flex flex-col items-center w-6">
                              <div className={`w-3 h-3 rounded-full border-2 border-white ${CHAIN_STATUS_DOT[step.status]} shrink-0 mt-1`} />
                              {!isLast && <div className="w-0.5 flex-1 bg-border" />}
                            </div>
                            <div className={`flex-1 pb-4 ${isLast ? "pb-0" : ""}`}>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${step.status === "blocked" ? "text-red-700" : step.status === "done" ? "text-muted line-through" : "text-foreground"}`}>
                                  {step.name}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                  step.status === "done" ? "bg-emerald-50 text-emerald-700" :
                                  step.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                                  step.status === "blocked" ? "bg-red-50 text-red-700" :
                                  "bg-gray-100 text-muted"
                                }`}>
                                  {stepLabel}
                                </span>
                              </div>
                              {i < chain.chain.length - 1 && (
                                <p className="text-[10px] text-muted mt-0.5">↓ depends on next</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted">Chain Progress</span>
                        <span className="font-semibold text-foreground">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${chain.status === "blocked" ? "bg-red-500" : chain.status === "at_risk" ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ HIGH PRIORITY TASKS (always visible bottom) ══════════ */}
      {activeTab === "overview" && (
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-500" />
            High Priority Tasks
            <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-muted font-medium">{HIGH_PRIORITY_TASKS.length}</span>
          </h3>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Task</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Priority</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Owner</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Due</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Deps</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Demo</th>
                </tr>
              </thead>
              <tbody>
                {HIGH_PRIORITY_TASKS.map((task) => {
                  const pcfg = PRIORITY_CONFIG[task.priority];
                  return (
                    <tr key={task.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-sm text-foreground">{task.title}</span>
                        {task.linkedMilestone && (
                          <span className="ml-2 text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">{task.linkedMilestone}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pcfg.bg} ${pcfg.color}`}>{pcfg.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center">
                            <span className="text-[8px] font-bold text-primary">{task.ownerAvatar}</span>
                          </div>
                          <span className="text-xs text-foreground">{task.owner}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-medium ${task.daysLeft <= 2 ? "text-red-600" : task.daysLeft <= 4 ? "text-amber-600" : "text-muted"}`}>
                          {task.daysLeft}d left
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs text-muted">{task.dependencyCount}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {task.isDemoBlocking ? (
                          <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[9px] font-bold border border-red-200">BLOCKING</span>
                        ) : (
                          <span className="text-[10px] text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quick Stat Card ────────────────────────────────────────

function QuickStat({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: number; sub: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${accent}`} />
        <span className="text-xs text-muted font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted mt-0.5">{sub}</p>
    </div>
  );
}
