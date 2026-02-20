"use client";

import { useRepo } from "@/lib/repo-context";
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Moon,
  Flame,
  ArrowUpRight,
  Eye,
  Merge,
  ChevronDown,
  ChevronUp,
  Zap,
  Activity,
  Loader2,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import type { PRStatus, BranchStatus } from "@/lib/repo-types";

type Tab = "overview" | "prs" | "branches" | "commits" | "contributors";

// ─── Config Maps ────────────────────────────────────────────

const PR_STATUS_CONFIG: Record<PRStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending_review: { label: "Pending Review", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Eye },
  approved: { label: "Approved", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: CheckCircle2 },
  blocked: { label: "Blocked", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
  ready_to_merge: { label: "Ready to Merge", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: Merge },
  merged: { label: "Merged", color: "text-violet-700", bg: "bg-violet-50 border-violet-200", icon: GitPullRequest },
  closed: { label: "Closed", color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: XCircle },
};

const BRANCH_STATUS_CONFIG: Record<BranchStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-emerald-700", bg: "bg-emerald-50" },
  outdated: { label: "Outdated", color: "text-amber-700", bg: "bg-amber-50" },
  stale: { label: "Stale", color: "text-orange-700", bg: "bg-orange-50" },
  abandoned: { label: "Abandoned", color: "text-red-700", bg: "bg-red-50" },
};

const RISK_DOT: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  info: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  warning: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  critical: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
};

export default function RepoIntelligencePage() {
  const { data, refreshSync } = useRepo();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [prFilter, setPrFilter] = useState<PRStatus | "all">("all");
  const [branchFilter, setBranchFilter] = useState<BranchStatus | "all">("all");
  const [insightExpanded, setInsightExpanded] = useState<string | null>(null);

  // ── Derived stats ──────────────────────────────────────

  const prsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const pr of data.pullRequests) {
      map[pr.status] = (map[pr.status] || 0) + 1;
    }
    return map;
  }, [data.pullRequests]);

  const filteredPRs = prFilter === "all" ? data.pullRequests : data.pullRequests.filter((pr) => pr.status === prFilter);
  const filteredBranches = branchFilter === "all" ? data.branches : data.branches.filter((b) => b.status === branchFilter);

  const totalCommitsToday = data.dailyActivity.length > 0 ? data.dailyActivity[data.dailyActivity.length - 1].commits : 0;
  const maxDailyCommits = Math.max(...data.dailyActivity.map((d) => d.commits), 1);
  const lateNightTotal = data.contributors.reduce((a, c) => a + c.lateNightCommits, 0);
  const criticalInsights = data.insights.filter((i) => i.severity === "critical").length;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "prs", label: "Pull Requests", count: data.pullRequests.length },
    { key: "branches", label: "Branches", count: data.branches.length },
    { key: "commits", label: "Commits", count: data.recentCommits.length },
    { key: "contributors", label: "Contributors", count: data.contributors.length },
  ];

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

  return (
    <div className="max-w-350 mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-primary" />
            Repository Intelligence
          </h1>
          <p className="text-sm text-muted mt-1">
            {data.repoName} · Last synced {formatRelative(data.lastSyncAt)}
          </p>
        </div>
        <button
          onClick={refreshSync}
          disabled={data.syncStatus === "syncing"}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium text-foreground hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {data.syncStatus === "syncing" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {data.syncStatus === "syncing" ? "Syncing…" : "Sync Now"}
        </button>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard icon={GitPullRequest} label="Open PRs" value={data.pullRequests.filter((p) => !["merged", "closed"].includes(p.status)).length} sub={`${prsByStatus["blocked"] || 0} blocked`} accent="text-primary" />
        <StatCard icon={GitBranch} label="Active Branches" value={data.branches.filter((b) => b.status === "active").length} sub={`${data.branches.filter((b) => b.status === "stale" || b.status === "abandoned").length} stale`} accent="text-emerald-600" />
        <StatCard icon={GitCommit} label="Commits Today" value={totalCommitsToday} sub="across all contributors" accent="text-blue-600" />
        <StatCard icon={Moon} label="Late Night" value={lateNightTotal} sub="commits this sprint" accent="text-violet-600" />
        <StatCard icon={AlertTriangle} label="Critical Alerts" value={criticalInsights} sub={`${data.insights.length} total insights`} accent="text-red-600" />
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold text-muted">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          OVERVIEW TAB
         ════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-5">
          {/* Left column — Insights */}
          <div className="col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              AI Insights
              <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-muted">{data.insights.length}</span>
            </h3>
            <div className="space-y-2">
              {data.insights.map((insight) => {
                const sev = SEVERITY_CONFIG[insight.severity];
                const isExpanded = insightExpanded === insight.id;
                return (
                  <div key={insight.id} className={`rounded-xl border ${sev.border} overflow-hidden`}>
                    <button
                      onClick={() => setInsightExpanded(isExpanded ? null : insight.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50/50 transition-colors cursor-pointer`}
                    >
                      <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${sev.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${sev.bg} ${sev.color}`}>
                            {insight.severity}
                          </span>
                          <span className="text-[10px] text-muted">{formatRelative(insight.timestamp)}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{insight.title}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3 pl-11">
                        <p className="text-sm text-muted leading-relaxed">{insight.description}</p>
                        {insight.actionable && (
                          <button className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                            {insight.actionLabel}
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Commit Activity Chart */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Commit Activity (14 days)
                </h3>
                <p className="text-xs text-muted">
                  {data.dailyActivity.reduce((a, d) => a + d.commits, 0)} total commits
                </p>
              </div>
              <div className="flex items-end gap-1.5 h-28">
                {data.dailyActivity.map((day) => {
                  const pct = (day.commits / maxDailyCommits) * 100;
                  const date = new Date(day.date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1" title={`${day.date}: ${day.commits} commits`}>
                      <span className="text-[9px] text-muted font-medium">{day.commits}</span>
                      <div
                        className={`w-full rounded-t-md transition-all ${isWeekend ? "bg-gray-200" : pct > 70 ? "bg-primary" : pct > 40 ? "bg-primary/60" : "bg-primary/30"}`}
                        style={{ height: `${Math.max(pct, 4)}%` }}
                      />
                      <span className="text-[8px] text-muted">
                        {date.toLocaleDateString("en-US", { weekday: "narrow" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column — PR Summary + Top Contributors */}
          <div className="space-y-4">
            {/* PR Summary */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-primary" />
                PR Overview
              </h3>
              {(["pending_review", "approved", "blocked", "ready_to_merge"] as PRStatus[]).map((status) => {
                const cfg = PR_STATUS_CONFIG[status];
                const Icon = cfg.icon;
                const count = prsByStatus[status] || 0;
                return (
                  <button
                    key={status}
                    onClick={() => { setActiveTab("prs"); setPrFilter(status); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                    <span className="flex-1 text-sm text-foreground text-left">{cfg.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Top Contributors
              </h3>
              {data.contributors
                .sort((a, b) => b.meaningfulCommits - a.meaningfulCommits)
                .map((c) => (
                  <div key={c.contributor.id} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{c.contributor.avatar}</span>
                      </div>
                      {c.burnoutRisk !== "low" && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white" title="Burnout risk" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{c.contributor.name}</p>
                      <p className="text-[10px] text-muted">{c.meaningfulCommits} commits · {c.prsReviewed} reviews</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-primary">
                      <Flame className="w-3 h-3" />
                      {c.streak}d
                    </div>
                  </div>
                ))}
            </div>

            {/* Branch Health */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary" />
                Branch Health
              </h3>
              {(["active", "outdated", "stale", "abandoned"] as BranchStatus[]).map((status) => {
                const cfg = BRANCH_STATUS_CONFIG[status];
                const count = data.branches.filter((b) => b.status === status).length;
                return (
                  <div key={status} className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-xs text-foreground">{cfg.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PULL REQUESTS TAB
         ════════════════════════════════════════════════════ */}
      {activeTab === "prs" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Filter:</span>
            {(["all", "pending_review", "approved", "blocked", "ready_to_merge"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setPrFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  prFilter === f ? "bg-primary text-white" : "bg-gray-100 text-muted hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : PR_STATUS_CONFIG[f].label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredPRs.map((pr) => {
              const cfg = PR_STATUS_CONFIG[pr.status];
              const StatusIcon = cfg.icon;
              return (
                <div key={pr.id} className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.bg}`}>
                      <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted font-mono">#{pr.number}</span>
                        <h4 className="text-sm font-semibold text-foreground">{pr.title}</h4>
                        {pr.isDraft && <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[9px] text-muted font-medium">DRAFT</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted mb-3">
                        <span>{pr.author.name}</span>
                        <span>·</span>
                        <span>{pr.branch} → {pr.targetBranch}</span>
                        <span>·</span>
                        <span>{formatRelative(pr.createdAt)}</span>
                      </div>

                      {/* Reviewers */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {pr.reviewers.map((r) => {
                          const rColor =
                            r.status === "approved" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : r.status === "changes_requested" ? "bg-red-50 border-red-200 text-red-700"
                            : r.status === "commented" ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-gray-50 border-gray-200 text-gray-600";
                          return (
                            <span key={r.reviewer.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium ${rColor}`}>
                              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[8px] font-bold">{r.reviewer.avatar}</span>
                              {r.reviewer.name}
                              <span className="opacity-60">({r.status.replace("_", " ")})</span>
                            </span>
                          );
                        })}
                        {pr.reviewers.length === 0 && (
                          <span className="text-[10px] text-amber-600 italic">No reviewers assigned</span>
                        )}
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <span className="text-emerald-600">+{pr.additions}</span>
                          <span className="text-red-500">−{pr.deletions}</span>
                        </span>
                        <span>{pr.filesChanged} files</span>
                        {pr.unresolvedComments > 0 && (
                          <span className="text-amber-600">{pr.unresolvedComments} unresolved</span>
                        )}
                        <span className={`flex items-center gap-1 ${pr.checksStatus === "passing" ? "text-emerald-600" : pr.checksStatus === "failing" ? "text-red-600" : "text-amber-600"}`}>
                          {pr.checksStatus === "passing" ? <CheckCircle2 className="w-3 h-3" /> : pr.checksStatus === "failing" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          CI {pr.checksStatus}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${RISK_DOT[pr.riskLevel]}`} />
                          {pr.riskLevel} risk
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <p className="text-[10px] text-muted mt-2">{pr.hoursOpen}h open</p>
                    </div>
                  </div>

                  {/* Labels */}
                  {pr.labels.length > 0 && (
                    <div className="flex gap-1.5 mt-3 ml-14">
                      {pr.labels.map((l) => (
                        <span key={l} className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-muted font-medium">{l}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          BRANCHES TAB
         ════════════════════════════════════════════════════ */}
      {activeTab === "branches" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Status:</span>
            {(["all", "active", "outdated", "stale", "abandoned"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setBranchFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  branchFilter === f ? "bg-primary text-white" : "bg-gray-100 text-muted hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : BRANCH_STATUS_CONFIG[f].label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Branch</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Ahead / Behind</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Merge Readiness</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Last Commit</th>
                  <th className="text-right px-5 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Age</th>
                </tr>
              </thead>
              <tbody>
                {filteredBranches.map((branch) => {
                  const bCfg = BRANCH_STATUS_CONFIG[branch.status];
                  const mergeColor =
                    branch.mergeReadiness === "ready" ? "text-emerald-700 bg-emerald-50"
                    : branch.mergeReadiness === "needs_rebase" ? "text-amber-700 bg-amber-50"
                    : branch.mergeReadiness === "conflicts" ? "text-red-700 bg-red-50"
                    : "text-orange-700 bg-orange-50";
                  return (
                    <tr key={branch.name} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-3.5 h-3.5 text-muted" />
                          <span className="text-sm font-mono text-foreground">{branch.name}</span>
                          {branch.linkedPR && (
                            <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">PR linked</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${bCfg.bg} ${bCfg.color}`}>
                          {bCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs">
                          <span className="text-emerald-600">↑{branch.aheadOf}</span>
                          <span className="text-muted mx-1">/</span>
                          <span className="text-red-500">↓{branch.behindBy}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${mergeColor}`}>
                          {branch.mergeReadiness.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-xs text-foreground">{branch.lastCommitAuthor}</p>
                        <p className="text-[10px] text-muted">{formatRelative(branch.lastCommitAt)}</p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-xs font-medium ${branch.daysOld > 7 ? "text-red-600" : branch.daysOld > 3 ? "text-amber-600" : "text-muted"}`}>
                          {branch.daysOld}d
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          COMMITS TAB
         ════════════════════════════════════════════════════ */}
      {activeTab === "commits" && (
        <div className="space-y-4">
          {/* Midnight activity alert */}
          {lateNightTotal > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-violet-50 border border-violet-200 rounded-xl">
              <Moon className="w-4 h-4 text-violet-600" />
              <p className="text-sm text-violet-800">
                <strong>{lateNightTotal} late-night/midnight commits</strong> detected this sprint. Monitor team for burnout risk.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {data.recentCommits.map((commit) => {
              const isLate = commit.timeCategory === "late_night" || commit.timeCategory === "midnight";
              const isWeekend = commit.timeCategory === "weekend";
              return (
                <div key={commit.sha} className={`bg-white rounded-xl border ${isLate ? "border-violet-200" : "border-border"} px-5 py-3 flex items-center gap-4`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLate ? "bg-violet-100" : isWeekend ? "bg-amber-100" : "bg-gray-100"}`}>
                    <GitCommit className={`w-4 h-4 ${isLate ? "text-violet-600" : isWeekend ? "text-amber-600" : "text-muted"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">{commit.message}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                      <span>{commit.author.name}</span>
                      <span>·</span>
                      <span className="font-mono">{commit.sha}</span>
                      <span>·</span>
                      <span className="text-emerald-600">+{commit.additions}</span>
                      <span className="text-red-500">−{commit.deletions}</span>
                      <span>· {commit.filesChanged} files</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted">{formatRelative(commit.timestamp)}</p>
                    {isLate && (
                      <span className="flex items-center gap-1 text-[9px] text-violet-600 font-medium mt-0.5">
                        <Moon className="w-2.5 h-2.5" />
                        {commit.timeCategory === "midnight" ? "Midnight" : "Late night"}
                      </span>
                    )}
                    {isWeekend && (
                      <span className="text-[9px] text-amber-600 font-medium mt-0.5">Weekend</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          CONTRIBUTORS TAB
         ════════════════════════════════════════════════════ */}
      {activeTab === "contributors" && (
        <div className="grid grid-cols-2 gap-5">
          {data.contributors.map((c) => {
            const burnColor =
              c.burnoutRisk === "high" ? "text-red-700 bg-red-50 border-red-200"
              : c.burnoutRisk === "moderate" ? "text-amber-700 bg-amber-50 border-amber-200"
              : "text-emerald-700 bg-emerald-50 border-emerald-200";
            return (
              <div key={c.contributor.id} className="bg-white rounded-2xl border border-border p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{c.contributor.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{c.contributor.name}</p>
                    <p className="text-[10px] text-muted">Active {c.activeDays} days · {c.streak}-day streak</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${burnColor}`}>
                    {c.burnoutRisk === "low" ? "Healthy" : c.burnoutRisk === "moderate" ? "Monitor" : "Burnout Risk"}
                  </span>
                </div>

                {/* Meaningful vs Total commits */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted">Meaningful commits</span>
                    <span className="font-medium text-foreground">{c.meaningfulCommits}/{c.totalCommits}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(c.meaningfulCommits / c.totalCommits) * 100}%` }} />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-3">
                  <MetricCell label="PRs Opened" value={c.prsOpened} icon={GitPullRequest} />
                  <MetricCell label="Reviews" value={c.prsReviewed} icon={Eye} />
                  <MetricCell label="Avg Review" value={`${c.avgReviewTime}h`} icon={Clock} />
                  <MetricCell label="Lines +" value={formatNum(c.linesAdded)} icon={TrendingUp} />
                </div>

                {/* Late night / weekend breakdown */}
                {(c.lateNightCommits > 0 || c.weekendCommits > 0) && (
                  <div className="flex items-center gap-4 pt-2 border-t border-border">
                    {c.lateNightCommits > 0 && (
                      <span className="flex items-center gap-1 text-xs text-violet-600">
                        <Moon className="w-3 h-3" />
                        {c.lateNightCommits} late-night
                      </span>
                    )}
                    {c.weekendCommits > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <Clock className="w-3 h-3" />
                        {c.weekendCommits} weekend
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: number | string; sub: string; accent: string;
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

function MetricCell({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="text-center">
      <Icon className="w-3.5 h-3.5 text-muted mx-auto mb-1" />
      <p className="text-sm font-bold text-foreground">{value}</p>
      <p className="text-[8px] text-muted">{label}</p>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
