"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/lib/project-context";
import {
  BarChart3,
  GitCommit,
  Users,
  Clock,
  RefreshCw,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";
import { useState, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────

type TimeRange = "7D" | "30D" | "3M" | "YTD";

interface ContributorStat {
  name: string;
  role: string;
  avatar: string;
  commits: number;
  prs: number;
  reviews: number;
}

interface DailyPR {
  day: string;
  merged: number;
  opened: number;
}

interface ModuleOwnership {
  module: string;
  percent: number;
  color: string;
}

interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
  type: "commit" | "pr" | "review" | "deploy";
}

// ─── Seed Data ──────────────────────────────────────────────

const STAT_CARDS = {
  "7D":  { commits: 312, commitsDelta: "+8%",  contributors: 28, contribDelta: "+1", mergeTime: "3.8 hrs", mergeDelta: "-0.4 hrs", churnRate: "9%",  churnDelta: "-2%" },
  "30D": { commits: 1248, commitsDelta: "+15%", contributors: 32, contribDelta: "+2", mergeTime: "4.2 hrs", mergeDelta: "-1.5 hrs", churnRate: "12%", churnDelta: "-3%" },
  "3M":  { commits: 3842, commitsDelta: "+22%", contributors: 35, contribDelta: "+5", mergeTime: "5.1 hrs", mergeDelta: "-2.3 hrs", churnRate: "14%", churnDelta: "-1%" },
  "YTD": { commits: 4960, commitsDelta: "+18%", contributors: 38, contribDelta: "+8", mergeTime: "4.8 hrs", mergeDelta: "-1.9 hrs", churnRate: "11%", churnDelta: "-4%" },
};

const CONTRIBUTORS: ContributorStat[] = [
  { name: "Sarah Jenkins", role: "Frontend Lead", avatar: "SJ", commits: 843, prs: 67, reviews: 124 },
  { name: "Michael Chen", role: "Backend Eng", avatar: "MC", commits: 621, prs: 53, reviews: 98 },
  { name: "Jessica Wu", role: "DevOps", avatar: "JW", commits: 590, prs: 41, reviews: 76 },
  { name: "Rahul Sharma", role: "Full Stack", avatar: "RS", commits: 445, prs: 38, reviews: 62 },
  { name: "Emily Davis", role: "Frontend Eng", avatar: "ED", commits: 389, prs: 29, reviews: 51 },
];

const PR_VELOCITY: DailyPR[] = [
  { day: "Mon", merged: 12, opened: 8 },
  { day: "Tue", merged: 9, opened: 14 },
  { day: "Wed", merged: 15, opened: 11 },
  { day: "Thu", merged: 18, opened: 13 },
  { day: "Fri", merged: 22, opened: 16 },
  { day: "Sat", merged: 6, opened: 3 },
  { day: "Sun", merged: 4, opened: 2 },
];

const CODE_OWNERSHIP: ModuleOwnership[] = [
  { module: "Backend API", percent: 50, color: "#2563eb" },
  { module: "Frontend UI", percent: 25, color: "#06b6d4" },
  { module: "DevOps/Infra", percent: 25, color: "#64748b" },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "a1", user: "Sarah Jenkins", avatar: "SJ", action: "merged PR", target: "#312 — Dashboard redesign", time: "12 min ago", type: "pr" },
  { id: "a2", user: "Michael Chen", avatar: "MC", action: "pushed 3 commits to", target: "feature/auth-v2", time: "28 min ago", type: "commit" },
  { id: "a3", user: "Jessica Wu", avatar: "JW", action: "deployed to", target: "staging-env", time: "1h ago", type: "deploy" },
  { id: "a4", user: "Rahul Sharma", avatar: "RS", action: "reviewed PR", target: "#308 — API rate limiting", time: "2h ago", type: "review" },
  { id: "a5", user: "Emily Davis", avatar: "ED", action: "pushed 5 commits to", target: "feature/notifications", time: "3h ago", type: "commit" },
  { id: "a6", user: "Sarah Jenkins", avatar: "SJ", action: "opened PR", target: "#315 — Settings page v2", time: "4h ago", type: "pr" },
  { id: "a7", user: "Michael Chen", avatar: "MC", action: "merged PR", target: "#306 — Redis caching", time: "5h ago", type: "pr" },
  { id: "a8", user: "Jessica Wu", avatar: "JW", action: "deployed to", target: "production", time: "6h ago", type: "deploy" },
];

// Heatmap: 52 weeks × 7 days
function generateHeatmapData(): number[][] {
  const data: number[][] = [];
  for (let week = 0; week < 52; week++) {
    const row: number[] = [];
    for (let day = 0; day < 7; day++) {
      // More activity on weekdays; random pattern
      const isWeekday = day < 5;
      const base = isWeekday ? 2 : 0;
      const max = isWeekday ? 4 : 2;
      // Deterministic hash-like value from week+day
      const val = ((week * 7 + day) * 2654435761) % 100;
      if (val < 20) row.push(0);
      else if (val < 45) row.push(Math.min(base + 1, 4));
      else if (val < 70) row.push(Math.min(base + 2, 4));
      else if (val < 88) row.push(Math.min(max, 4));
      else row.push(4);
    }
    data.push(row);
  }
  return data;
}

const HEATMAP_COLORS = ["#f1f5f9", "#bbf7d0", "#4ade80", "#16a34a", "#15803d"];

// ─── Component ──────────────────────────────────────────────

export default function InsightsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject } = useProjects();
  const project = getProject(projectId);

  const [timeRange, setTimeRange] = useState<TimeRange>("30D");
  const [search, setSearch] = useState("");

  const stats = STAT_CARDS[timeRange];
  const heatmap = useMemo(() => generateHeatmapData(), []);

  const maxPR = useMemo(() => Math.max(...PR_VELOCITY.flatMap((d) => [d.merged, d.opened])), []);

  const timeRanges: TimeRange[] = ["7D", "30D", "3M", "YTD"];

  // Donut chart SVG helpers
  const totalModules = 12;
  const donutSegments = useMemo(() => {
    let cumulative = 0;
    return CODE_OWNERSHIP.map((m) => {
      const start = cumulative;
      cumulative += m.percent;
      return { ...m, start, end: cumulative };
    });
  }, []);

  return (
    <div className="max-w-350 mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Contribution Analytics
          </h1>
          <p className="text-sm text-muted mt-1">
            Track contributor activity, merge velocity, and code ownership trends.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contributors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-56 text-sm rounded-lg bg-white border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* ── Team Velocity Header + Time Range ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Team Velocity</h2>
          <p className="text-sm text-muted">Track contributor activity, merge velocity, and code ownership trends.</p>
        </div>
        <div className="flex items-center bg-white border border-border rounded-lg overflow-hidden">
          {timeRanges.map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                timeRange === tr
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground hover:bg-gray-50"
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ STAT CARDS ══════════ */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={GitCommit}
          label="Total Commits"
          value={stats.commits.toLocaleString()}
          delta={stats.commitsDelta}
          positive={stats.commitsDelta.startsWith("+")}
        />
        <StatCard
          icon={Users}
          label="Active Contributors"
          value={String(stats.contributors)}
          delta={stats.contribDelta}
          positive={stats.contribDelta.startsWith("+")}
        />
        <StatCard
          icon={Clock}
          label="Avg. Merge Time"
          value={stats.mergeTime}
          delta={stats.mergeDelta}
          positive={stats.mergeDelta.startsWith("-")}
        />
        <StatCard
          icon={RefreshCw}
          label="Code Churn Rate"
          value={stats.churnRate}
          delta={stats.churnDelta}
          positive={stats.churnDelta.startsWith("-")}
        />
      </div>

      {/* ══════════ HEATMAP + TOP CONTRIBUTORS ══════════ */}
      <div className="grid grid-cols-3 gap-5">
        {/* Contribution Heatmap */}
        <div className="col-span-2 bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Contribution Heatmap</h3>
              <p className="text-xs text-muted">Daily commit density across all branches</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted">
              Less
              {HEATMAP_COLORS.map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
              ))}
              More
            </div>
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-0.75 overflow-x-auto pb-2">
            {/* Day labels */}
            <div className="flex flex-col gap-0.75 mr-1 shrink-0">
              {["Mon", "", "Wed", "", "Fri", "", ""].map((d, i) => (
                <div key={i} className="h-2.75 flex items-center">
                  <span className="text-[9px] text-muted w-6 text-right">{d}</span>
                </div>
              ))}
            </div>
            {heatmap.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.75">
                {week.map((val, di) => (
                  <div
                    key={di}
                    className="w-2.75 h-2.75 rounded-sm"
                    style={{ backgroundColor: HEATMAP_COLORS[val] }}
                    title={`${val} commits`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Contributors</h3>
          <div className="space-y-3.5 flex-1">
            {CONTRIBUTORS.slice(0, 3).map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary/80 to-primary flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-white">{c.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-[10px] text-muted">{c.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{c.commits}</p>
                  <p className="text-[9px] text-muted">commits</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-gray-50 transition-colors">
            View All Team
          </button>
        </div>
      </div>

      {/* ══════════ PR VELOCITY + CODE OWNERSHIP ══════════ */}
      <div className="grid grid-cols-2 gap-5">
        {/* PR Merge Velocity */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-foreground">PR Merge Velocity</h3>
              <p className="text-xs text-muted">Open vs. Merged PRs over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                Merged
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                Opened
              </span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="mt-6 flex items-end justify-between gap-2 h-44">
            {PR_VELOCITY.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1" style={{ height: "160px" }}>
                  {/* Merged bar */}
                  <div
                    className="w-5 bg-primary rounded-t-sm transition-all duration-300"
                    style={{ height: `${(d.merged / maxPR) * 140}px` }}
                    title={`${d.merged} merged`}
                  />
                  {/* Opened bar */}
                  <div
                    className="w-5 bg-gray-200 rounded-t-sm transition-all duration-300"
                    style={{ height: `${(d.opened / maxPR) * 140}px` }}
                    title={`${d.opened} opened`}
                  />
                </div>
                <span className="text-[10px] text-muted">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code Ownership */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-6">Code Ownership</h3>
          <div className="flex items-center gap-8">
            {/* Donut chart */}
            <div className="relative w-36 h-36 shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                {donutSegments.map((seg) => {
                  const circumference = 2 * Math.PI * 45;
                  const offset = (seg.start / 100) * circumference;
                  const length = (seg.percent / 100) * circumference;
                  return (
                    <circle
                      key={seg.module}
                      cx="60"
                      cy="60"
                      r="45"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="18"
                      strokeDasharray={`${length} ${circumference - length}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="butt"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{totalModules}</span>
                <span className="text-[9px] text-muted uppercase tracking-wider font-semibold">Modules</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-4 flex-1">
              {CODE_OWNERSHIP.map((m) => (
                <div key={m.module} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="text-sm text-foreground">{m.module}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{m.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ RECENT ACTIVITY ══════════ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
          <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View All History
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-border divide-y divide-border">
          {RECENT_ACTIVITY.map((item) => {
            const typeColor =
              item.type === "commit" ? "bg-emerald-100 text-emerald-700" :
              item.type === "pr" ? "bg-blue-100 text-blue-700" :
              item.type === "review" ? "bg-amber-100 text-amber-700" :
              "bg-violet-100 text-violet-700";
            const typeLabel =
              item.type === "commit" ? "Commit" :
              item.type === "pr" ? "PR" :
              item.type === "review" ? "Review" : "Deploy";
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary/80 to-primary flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-white">{item.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{item.user}</span>
                    <span className="text-muted"> {item.action} </span>
                    <span className="font-medium text-primary">{item.target}</span>
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${typeColor}`}>{typeLabel}</span>
                <span className="text-[11px] text-muted shrink-0 w-20 text-right">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════ AI INSIGHT BANNER ══════════ */}
      <div className="bg-linear-to-r from-primary/5 to-violet-50 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary mb-0.5">✦ AI Insight</p>
          <p className="text-sm text-foreground leading-relaxed">
            Your team&apos;s merge velocity increased by 15% this week. Great job!
            PRs are being reviewed 1.5 hours faster on average compared to last month.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, delta, positive }: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted font-medium">{label}</span>
        <Icon className="w-4 h-4 text-muted" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className={`text-xs font-medium flex items-center gap-0.5 mb-0.5 ${positive ? "text-emerald-600" : "text-red-500"}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {delta}
        </span>
      </div>
    </div>
  );
}
