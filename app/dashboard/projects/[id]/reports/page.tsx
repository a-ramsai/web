"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/lib/project-context";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Bug,
  CheckCircle2,
  Users,
  Zap,
  Download,
  Target,
  Shield,
  Rocket,
} from "lucide-react";
import { useState } from "react";

// ─── Types ──────────────────────────────────────────────────

type ReportTab = "sprint" | "velocity" | "quality" | "team" | "deployments";

// ─── Seed Data ──────────────────────────────────────────────

// Sprint Burndown (14-day sprint)
const BURNDOWN_IDEAL = [70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0];
const BURNDOWN_ACTUAL = [70, 68, 62, 58, 55, 48, 45, 42, 38, 33, 28, null, null, null, null];
const SPRINT_DAYS = Array.from({ length: 15 }, (_, i) => `Day ${i}`);

// Velocity per sprint (story points)
const VELOCITY_DATA = [
  { sprint: "Sprint 1", committed: 42, completed: 38 },
  { sprint: "Sprint 2", committed: 48, completed: 44 },
  { sprint: "Sprint 3", committed: 52, completed: 50 },
  { sprint: "Sprint 4", committed: 55, completed: 47 },
  { sprint: "Sprint 5", committed: 50, completed: 51 },
  { sprint: "Sprint 6", committed: 58, completed: 52 },
  { sprint: "Sprint 7 (current)", committed: 54, completed: 32 },
];

// Issue breakdown by type
const ISSUE_BY_TYPE = [
  { type: "Bug", count: 24, color: "#ef4444" },
  { type: "Feature", count: 18, color: "#8b5cf6" },
  { type: "Improvement", count: 12, color: "#3b82f6" },
  { type: "Task", count: 16, color: "#10b981" },
];

// Issue breakdown by status
const ISSUE_BY_STATUS = [
  { status: "Open", count: 14, color: "#10b981" },
  { status: "In Progress", count: 8, color: "#3b82f6" },
  { status: "Resolved", count: 28, color: "#8b5cf6" },
  { status: "Closed", count: 20, color: "#94a3b8" },
];

// Issue breakdown by priority
const ISSUE_BY_PRIORITY = [
  { priority: "Critical", count: 4, color: "#ef4444" },
  { priority: "High", count: 12, color: "#f97316" },
  { priority: "Medium", count: 22, color: "#f59e0b" },
  { priority: "Low", count: 32, color: "#10b981" },
];

// Code quality over time (weekly)
const CODE_QUALITY = [
  { week: "W1", coverage: 72, bugs: 12, debt: 4.2, duplications: 3.1 },
  { week: "W2", coverage: 74, bugs: 10, debt: 3.8, duplications: 2.9 },
  { week: "W3", coverage: 73, bugs: 8, debt: 3.5, duplications: 2.7 },
  { week: "W4", coverage: 76, bugs: 11, debt: 3.2, duplications: 2.5 },
  { week: "W5", coverage: 78, bugs: 7, debt: 2.8, duplications: 2.3 },
  { week: "W6", coverage: 79, bugs: 5, debt: 2.5, duplications: 2.1 },
  { week: "W7", coverage: 81, bugs: 6, debt: 2.3, duplications: 1.9 },
  { week: "W8", coverage: 82, bugs: 4, debt: 2.1, duplications: 1.8 },
];

// PR cycle time (days)
const PR_CYCLE_TIME = [
  { week: "W1", timeToFirstReview: 8.2, timeToMerge: 18.5 },
  { week: "W2", timeToFirstReview: 6.5, timeToMerge: 14.2 },
  { week: "W3", timeToFirstReview: 7.1, timeToMerge: 16.8 },
  { week: "W4", timeToFirstReview: 5.3, timeToMerge: 12.4 },
  { week: "W5", timeToFirstReview: 4.8, timeToMerge: 10.6 },
  { week: "W6", timeToFirstReview: 3.9, timeToMerge: 9.2 },
  { week: "W7", timeToFirstReview: 3.5, timeToMerge: 8.1 },
  { week: "W8", timeToFirstReview: 3.2, timeToMerge: 7.5 },
];

// Team workload
const TEAM_WORKLOAD = [
  { name: "Sarah Chen", avatar: "SC", role: "Frontend Lead", assigned: 8, completed: 6, inReview: 2, blocked: 0 },
  { name: "Marcus Li", avatar: "ML", role: "Backend Eng", assigned: 10, completed: 5, inReview: 3, blocked: 2 },
  { name: "Priya Patel", avatar: "PP", role: "Full Stack", assigned: 7, completed: 5, inReview: 1, blocked: 1 },
  { name: "James Oduro", avatar: "JO", role: "DevOps", assigned: 6, completed: 4, inReview: 2, blocked: 0 },
  { name: "Emily Davis", avatar: "ED", role: "Frontend Eng", assigned: 5, completed: 3, inReview: 1, blocked: 1 },
];

// Deploy frequency
const DEPLOY_DATA = [
  { week: "W1", staging: 8, production: 2, rollbacks: 1 },
  { week: "W2", staging: 12, production: 3, rollbacks: 0 },
  { week: "W3", staging: 10, production: 2, rollbacks: 1 },
  { week: "W4", staging: 14, production: 4, rollbacks: 0 },
  { week: "W5", staging: 11, production: 3, rollbacks: 0 },
  { week: "W6", staging: 15, production: 5, rollbacks: 1 },
  { week: "W7", staging: 13, production: 4, rollbacks: 0 },
  { week: "W8", staging: 16, production: 6, rollbacks: 0 },
];

// Build success rate
const BUILD_DATA = [
  { week: "W1", total: 45, success: 38 },
  { week: "W2", total: 52, success: 47 },
  { week: "W3", total: 48, success: 40 },
  { week: "W4", total: 56, success: 52 },
  { week: "W5", total: 60, success: 55 },
  { week: "W6", total: 58, success: 54 },
  { week: "W7", total: 64, success: 61 },
  { week: "W8", total: 62, success: 60 },
];

// ─── Helper: SVG bar/line charts ────────────────────────────

function BarChart({ data, barKey, barColor, maxVal, labels, secondBarKey, secondBarColor, height = 180 }: {
  data: Record<string, number | string>[];
  barKey: string;
  barColor: string;
  maxVal: number;
  labels: string;
  secondBarKey?: string;
  secondBarColor?: string;
  height?: number;
}) {
  const barWidth = secondBarKey ? 16 : 28;
  const gap = secondBarKey ? 4 : 0;
  const groupWidth = secondBarKey ? (barWidth * 2 + gap) : barWidth;
  const spacing = Math.max(12, (700 - data.length * groupWidth) / (data.length + 1));
  const svgWidth = data.length * (groupWidth + spacing) + spacing;

  return (
    <div className="overflow-x-auto">
      <svg width={svgWidth} height={height + 30} viewBox={`0 0 ${svgWidth} ${height + 30}`}>
        {data.map((d, i) => {
          const x = spacing + i * (groupWidth + spacing);
          const v1 = Number(d[barKey]);
          const h1 = (v1 / maxVal) * height;
          return (
            <g key={i}>
              <rect x={x} y={height - h1} width={barWidth} height={h1} rx={4} fill={barColor} opacity={0.85} />
              {secondBarKey && secondBarColor && (
                <rect x={x + barWidth + gap} y={height - (Number(d[secondBarKey]) / maxVal) * height} width={barWidth} height={(Number(d[secondBarKey]) / maxVal) * height} rx={4} fill={secondBarColor} opacity={0.85} />
              )}
              <text x={x + groupWidth / 2} y={height + 18} textAnchor="middle" className="text-[10px]" fill="#94a3b8">
                {String(d[labels])}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LineChart({ data, lines, maxVal, labelKey, height = 180 }: {
  data: Record<string, number | string | null>[];
  lines: { key: string; color: string; dashed?: boolean }[];
  maxVal: number;
  labelKey: string;
  height?: number;
}) {
  const padding = 30;
  const w = data.length * 52 + padding * 2;
  const usableH = height - 10;

  const toX = (i: number) => padding + i * ((w - padding * 2) / (data.length - 1));
  const toY = (v: number) => usableH - (v / maxVal) * (usableH - 10) + 5;

  return (
    <div className="overflow-x-auto">
      <svg width={w} height={height + 30} viewBox={`0 0 ${w} ${height + 30}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={padding} x2={w - padding} y1={toY(maxVal * f)} y2={toY(maxVal * f)} stroke="#e2e8f0" strokeWidth={1} />
        ))}
        {/* Lines */}
        {lines.map((line) => {
          const points = data
            .map((d, i) => ({ x: toX(i), y: d[line.key] != null ? toY(Number(d[line.key])) : null }))
            .filter((p) => p.y !== null) as { x: number; y: number }[];
          const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          return (
            <g key={line.key}>
              <path d={pathD} fill="none" stroke={line.color} strokeWidth={2.5} strokeDasharray={line.dashed ? "6 4" : undefined} strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="white" stroke={line.color} strokeWidth={2} />
              ))}
            </g>
          );
        })}
        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={height + 18} textAnchor="middle" className="text-[10px]" fill="#94a3b8">
            {String(d[labelKey])}
          </text>
        ))}
      </svg>
    </div>
  );
}

function DonutChart({ segments, total, label, size = 140 }: {
  segments: { name: string; value: number; color: string }[];
  total: number;
  label: string;
  size?: number;
}) {
  const r = (size - 36) / 2;
  const circumference = 2 * Math.PI * r;

  // Pre-compute cumulative offsets
  const segmentsWithOffset = segments.reduce<{ name: string; value: number; color: string; offset: number }[]>((acc, seg) => {
    const prevTotal = acc.reduce((s, a) => s + a.value, 0);
    acc.push({ ...seg, offset: prevTotal });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          {segmentsWithOffset.map((seg) => {
            const pct = seg.value / total;
            const offset = (seg.offset / total) * circumference;
            const length = pct * circumference;
            return (
              <circle
                key={seg.name}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={18}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-foreground">{total}</span>
          <span className="text-[9px] text-muted uppercase tracking-wider font-semibold">{label}</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-foreground">{seg.name}</span>
            <span className="text-xs font-bold text-foreground ml-auto pl-3">{seg.value}</span>
            <span className="text-[10px] text-muted">({Math.round((seg.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StackedBar({ items, max }: { items: { label: string; segments: { value: number; color: string }[]; total: number }[]; max: number }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-foreground font-medium">{item.label}</span>
            <span className="text-muted">{item.total}</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
            {item.segments.map((seg, i) => (
              <div
                key={i}
                className="h-full transition-all"
                style={{ width: `${(seg.value / max) * 100}%`, backgroundColor: seg.color }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────

export default function ReportsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject } = useProjects();
  const project = getProject(projectId);

  const [activeTab, setActiveTab] = useState<ReportTab>("sprint");

  const tabs: { key: ReportTab; label: string; icon: React.ElementType }[] = [
    { key: "sprint", label: "Sprint", icon: Target },
    { key: "velocity", label: "Velocity & PRs", icon: Activity },
    { key: "quality", label: "Code Quality", icon: Shield },
    { key: "team", label: "Team", icon: Users },
    { key: "deployments", label: "Deployments", icon: Rocket },
  ];

  // Computed stats
  const avgVelocity = Math.round(VELOCITY_DATA.slice(0, -1).reduce((a, v) => a + v.completed, 0) / (VELOCITY_DATA.length - 1));
  const completionRate = Math.round((VELOCITY_DATA.slice(0, -1).reduce((a, v) => a + v.completed, 0) / VELOCITY_DATA.slice(0, -1).reduce((a, v) => a + v.committed, 0)) * 100);
  const latestQuality = CODE_QUALITY[CODE_QUALITY.length - 1];
  const latestBuild = BUILD_DATA[BUILD_DATA.length - 1];
  const buildSuccessRate = Math.round((latestBuild.success / latestBuild.total) * 100);
  const totalDeploys = DEPLOY_DATA.reduce((a, d) => a + d.production, 0);

  return (
    <div className="max-w-350 mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <PieChart className="w-6 h-6 text-primary" />
            Reports &amp; Visualizations
          </h1>
          <p className="text-sm text-muted mt-1">
            Visual analytics for {project?.name || "this project"} — sprints, velocity, quality, team, and deployments
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-5 gap-3">
        <MiniStat icon={Target} label="Avg Velocity" value={`${avgVelocity} pts`} delta={`${completionRate}% delivery`} positive />
        <MiniStat icon={Bug} label="Open Bugs" value="14" delta="-3 this week" positive />
        <MiniStat icon={CheckCircle2} label="Coverage" value={`${latestQuality.coverage}%`} delta="+10% over 8 weeks" positive />
        <MiniStat icon={Zap} label="Build Success" value={`${buildSuccessRate}%`} delta={`${latestBuild.success}/${latestBuild.total} builds`} positive />
        <MiniStat icon={Rocket} label="Prod Deploys" value={String(totalDeploys)} delta={`${DEPLOY_DATA[DEPLOY_DATA.length - 1].production} this week`} positive />
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => {
          const TIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <TIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════
          SPRINT TAB
         ═══════════════════════════════════════ */}
      {activeTab === "sprint" && (
        <div className="space-y-5">
          {/* Burndown */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Sprint Burndown</h3>
                <p className="text-xs text-muted">Remaining story points vs ideal trajectory — Sprint 7</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-0.5 bg-gray-400" style={{ borderTop: "2px dashed #94a3b8" }} />
                  Ideal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-0.5 bg-primary rounded-full" />
                  Actual
                </span>
              </div>
            </div>
            <LineChart
              data={SPRINT_DAYS.map((day, i) => ({
                day,
                ideal: BURNDOWN_IDEAL[i],
                actual: BURNDOWN_ACTUAL[i],
              }))}
              lines={[
                { key: "ideal", color: "#94a3b8", dashed: true },
                { key: "actual", color: "#2563eb" },
              ]}
              maxVal={75}
              labelKey="day"
              height={200}
            />
          </div>

          {/* Issue breakdown — 3 donuts */}
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Issues by Type</h3>
              <DonutChart
                segments={ISSUE_BY_TYPE.map((d) => ({ name: d.type, value: d.count, color: d.color }))}
                total={ISSUE_BY_TYPE.reduce((a, d) => a + d.count, 0)}
                label="Issues"
                size={130}
              />
            </div>
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Issues by Status</h3>
              <DonutChart
                segments={ISSUE_BY_STATUS.map((d) => ({ name: d.status, value: d.count, color: d.color }))}
                total={ISSUE_BY_STATUS.reduce((a, d) => a + d.count, 0)}
                label="Issues"
                size={130}
              />
            </div>
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Issues by Priority</h3>
              <DonutChart
                segments={ISSUE_BY_PRIORITY.map((d) => ({ name: d.priority, value: d.count, color: d.color }))}
                total={ISSUE_BY_PRIORITY.reduce((a, d) => a + d.count, 0)}
                label="Issues"
                size={130}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          VELOCITY & PRs TAB
         ═══════════════════════════════════════ */}
      {activeTab === "velocity" && (
        <div className="space-y-5">
          {/* Velocity bar chart */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Sprint Velocity</h3>
                <p className="text-xs text-muted">Committed vs Completed story points per sprint</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Committed</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed</span>
              </div>
            </div>
            <BarChart
              data={VELOCITY_DATA}
              barKey="committed"
              barColor="#2563eb"
              secondBarKey="completed"
              secondBarColor="#10b981"
              maxVal={65}
              labels="sprint"
              height={200}
            />
          </div>

          {/* PR Cycle Time */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">PR Cycle Time</h3>
                <p className="text-xs text-muted">Hours from PR open to first review & merge — trending down</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Time to First Review</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Time to Merge</span>
              </div>
            </div>
            <LineChart
              data={PR_CYCLE_TIME}
              lines={[
                { key: "timeToMerge", color: "#2563eb" },
                { key: "timeToFirstReview", color: "#f59e0b" },
              ]}
              maxVal={20}
              labelKey="week"
              height={180}
            />
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Avg First Review</p>
                <p className="text-lg font-bold text-foreground">{(PR_CYCLE_TIME.reduce((a, d) => a + d.timeToFirstReview, 0) / PR_CYCLE_TIME.length).toFixed(1)}h</p>
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Avg Merge Time</p>
                <p className="text-lg font-bold text-foreground">{(PR_CYCLE_TIME.reduce((a, d) => a + d.timeToMerge, 0) / PR_CYCLE_TIME.length).toFixed(1)}h</p>
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Trend</p>
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5" /> Improving</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          CODE QUALITY TAB
         ═══════════════════════════════════════ */}
      {activeTab === "quality" && (
        <div className="space-y-5">
          {/* Quality stat cards */}
          <div className="grid grid-cols-4 gap-4">
            <QualityCard label="Test Coverage" value={`${latestQuality.coverage}%`} subtext="Target: 85%" trend={`+${latestQuality.coverage - CODE_QUALITY[0].coverage}%`} good />
            <QualityCard label="Open Bugs" value={String(latestQuality.bugs)} subtext="Down from 12" trend={`-${CODE_QUALITY[0].bugs - latestQuality.bugs}`} good />
            <QualityCard label="Tech Debt" value={`${latestQuality.debt}h`} subtext="Estimated hours" trend={`-${(CODE_QUALITY[0].debt - latestQuality.debt).toFixed(1)}h`} good />
            <QualityCard label="Duplications" value={`${latestQuality.duplications}%`} subtext="Code duplication" trend={`-${(CODE_QUALITY[0].duplications - latestQuality.duplications).toFixed(1)}%`} good />
          </div>

          {/* Coverage trend */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Test Coverage Over Time</h3>
                <p className="text-xs text-muted">Steady improvement from 72% to 82% over 8 weeks</p>
              </div>
            </div>
            <LineChart
              data={CODE_QUALITY}
              lines={[{ key: "coverage", color: "#10b981" }]}
              maxVal={100}
              labelKey="week"
              height={180}
            />
          </div>

          {/* Bugs + Tech Debt */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Bug Count Trend</h3>
              <BarChart
                data={CODE_QUALITY}
                barKey="bugs"
                barColor="#ef4444"
                maxVal={15}
                labels="week"
                height={160}
              />
            </div>
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Tech Debt (hours)</h3>
              <LineChart
                data={CODE_QUALITY}
                lines={[{ key: "debt", color: "#f59e0b" }]}
                maxVal={5}
                labelKey="week"
                height={160}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          TEAM TAB
         ═══════════════════════════════════════ */}
      {activeTab === "team" && (
        <div className="space-y-5">
          {/* Team workload stacked bars */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Team Workload Distribution</h3>
                <p className="text-xs text-muted">Task breakdown per team member — completed, in review, blocked</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Review</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Blocked</span>
              </div>
            </div>
            <StackedBar
              items={TEAM_WORKLOAD.map((m) => ({
                label: m.name,
                segments: [
                  { value: m.completed, color: "#10b981" },
                  { value: m.inReview, color: "#f59e0b" },
                  { value: m.blocked, color: "#ef4444" },
                ],
                total: m.assigned,
              }))}
              max={Math.max(...TEAM_WORKLOAD.map((m) => m.assigned))}
            />
          </div>

          {/* Team member cards */}
          <div className="grid grid-cols-5 gap-3">
            {TEAM_WORKLOAD.map((m) => {
              const pct = Math.round((m.completed / m.assigned) * 100);
              return (
                <div key={m.name} className="bg-white rounded-2xl border border-border p-4 text-center">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xs font-bold text-primary">{m.avatar}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{m.name.split(" ")[0]}</p>
                  <p className="text-[10px] text-muted">{m.role}</p>
                  {/* Mini ring */}
                  <div className="relative w-14 h-14 mx-auto mt-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                      <circle cx="28" cy="28" r="22" fill="none" stroke={pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444"} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 138.2} 138.2`} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{pct}%</span>
                  </div>
                  <div className="mt-2 text-[10px] text-muted">
                    {m.completed}/{m.assigned} tasks
                  </div>
                  {m.blocked > 0 && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-50 border border-red-200 text-red-600">{m.blocked} blocked</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          DEPLOYMENTS TAB
         ═══════════════════════════════════════ */}
      {activeTab === "deployments" && (
        <div className="space-y-5">
          {/* Deploy stat cards */}
          <div className="grid grid-cols-4 gap-4">
            <QualityCard
              label="Total Prod Deploys"
              value={String(totalDeploys)}
              subtext={`${DEPLOY_DATA[DEPLOY_DATA.length - 1].production} this week`}
              trend={`+${DEPLOY_DATA[DEPLOY_DATA.length - 1].production - DEPLOY_DATA[0].production}`}
              good
            />
            <QualityCard
              label="Staging Deploys"
              value={String(DEPLOY_DATA.reduce((a, d) => a + d.staging, 0))}
              subtext="Total across 8 weeks"
              trend={`${DEPLOY_DATA[DEPLOY_DATA.length - 1].staging}/wk`}
              good
            />
            <QualityCard
              label="Build Success"
              value={`${buildSuccessRate}%`}
              subtext={`${latestBuild.success}/${latestBuild.total} builds`}
              trend={`+${buildSuccessRate - Math.round((BUILD_DATA[0].success / BUILD_DATA[0].total) * 100)}%`}
              good
            />
            <QualityCard
              label="Rollbacks"
              value={String(DEPLOY_DATA.reduce((a, d) => a + d.rollbacks, 0))}
              subtext="Total rollbacks"
              trend={DEPLOY_DATA.slice(-3).reduce((a, d) => a + d.rollbacks, 0) === 0 ? "0 in last 3wk" : "Needs attention"}
              good={DEPLOY_DATA.slice(-3).reduce((a, d) => a + d.rollbacks, 0) === 0}
            />
          </div>

          {/* Deploy freq chart */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Deployment Frequency</h3>
                <p className="text-xs text-muted">Staging vs Production deploys per week</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Staging</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Production</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Rollbacks</span>
              </div>
            </div>
            <BarChart
              data={DEPLOY_DATA}
              barKey="staging"
              barColor="#2563eb"
              secondBarKey="production"
              secondBarColor="#10b981"
              maxVal={20}
              labels="week"
              height={200}
            />
          </div>

          {/* Build success rate */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Build Success Rate</h3>
                <p className="text-xs text-muted">Percentage of successful CI builds per week</p>
              </div>
            </div>
            <LineChart
              data={BUILD_DATA.map((d) => ({ ...d, rate: Math.round((d.success / d.total) * 100) }))}
              lines={[{ key: "rate", color: "#10b981" }]}
              maxVal={100}
              labelKey="week"
              height={180}
            />
            {/* Success rate per week row */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              {BUILD_DATA.map((d) => {
                const rate = Math.round((d.success / d.total) * 100);
                return (
                  <div key={d.week} className="flex-1 text-center">
                    <p className={`text-sm font-bold ${rate >= 90 ? "text-emerald-600" : rate >= 80 ? "text-amber-600" : "text-red-600"}`}>{rate}%</p>
                    <p className="text-[9px] text-muted">{d.week}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub Components ─────────────────────────────────────────

function MiniStat({ icon: Icon, label, value, delta, positive }: {
  icon: React.ElementType; label: string; value: string; delta: string; positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className={`text-[10px] mt-0.5 flex items-center gap-0.5 ${positive ? "text-emerald-600" : "text-red-500"}`}>
        {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {delta}
      </p>
    </div>
  );
}

function QualityCard({ label, value, subtext, trend, good }: {
  label: string; value: string; subtext: string; trend: string; good: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="text-xs text-muted font-medium mb-2">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted mt-0.5">{subtext}</p>
      <p className={`text-xs font-medium mt-1 flex items-center gap-0.5 ${good ? "text-emerald-600" : "text-red-500"}`}>
        {good ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {trend}
      </p>
    </div>
  );
}
