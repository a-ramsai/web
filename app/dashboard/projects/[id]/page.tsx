"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/lib/project-context";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  AlertTriangle,
  Bug,
  ShieldCheck,
  Cloud,
  GitPullRequest,
  CheckCircle2,
  Loader2,
  XCircle,
  TrendingDown,
  Settings,
  ArrowUpRight,
} from "lucide-react";

/* ─── Mock Data ─── */
const HEALTH_SCORE = 92;

const STATS = [
  {
    label: "Open Issues",
    value: "14",
    trend: "-3%",
    trendUp: false,
    detail: "2 Critical, 4 High Priority",
    icon: Bug,
    bars: [
      { color: "bg-red-500", w: "w-12" },
      { color: "bg-primary", w: "w-20" },
    ],
  },
  {
    label: "Quality Gate",
    value: "A-",
    sub: "Passed",
    icon: ShieldCheck,
    badges: [
      { label: "SEC", grade: "A", color: "text-emerald-600 bg-emerald-50" },
      { label: "REL", grade: "A", color: "text-emerald-600 bg-emerald-50" },
      { label: "MAIN", grade: "B", color: "text-primary bg-primary-light" },
    ],
  },
  {
    label: "Production",
    value: "99.9%",
    sub: "Uptime",
    icon: Cloud,
    deploy: { version: "v2.4.0", hash: "83a2...", time: "2m ago" },
  },
  {
    label: "Open PRs",
    value: "8",
    sub: "Active",
    icon: GitPullRequest,
    reviewTime: "Avg review time: 4h 12m",
    avatars: ["AM", "SJ", "+2"],
  },
];

const DEPLOYMENTS = [
  {
    status: "success",
    title: "Merge pull request #342",
    env: "Production",
    envColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    author: "alex-morgan",
    hash: "83a2b9",
    time: "2m ago",
    duration: "1m 24s",
    durationLabel: "Duration",
  },
  {
    status: "building",
    title: "Update marketing landing page",
    env: "Preview",
    envColor: "bg-blue-50 text-blue-700 border-blue-200",
    author: "sarah-j",
    hash: "c4d2e1",
    time: "5m ago",
    duration: "Building...",
    durationLabel: "Status",
  },
  {
    status: "failed",
    title: "Fix pagination bug in API",
    env: "Preview",
    envColor: "bg-blue-50 text-blue-700 border-blue-200",
    author: "mike-t",
    hash: "f1g2h3",
    time: "24m ago",
    duration: "Failed",
    durationLabel: "Test timeout",
  },
];

const SPRINTS = [
  { label: "S-39", value: 35, active: false },
  { label: "S-40", value: 37, active: false },
  { label: "S-41", value: 39, active: false },
  { label: "S-42", value: 42, active: true },
];

function StatusIcon({ status }: { status: string }) {
  if (status === "success")
    return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (status === "building")
    return <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
  return <XCircle className="w-5 h-5 text-red-500" />;
}

/* ─── Health Ring SVG ─── */
function HealthRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-[130px] h-[130px]">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#2563eb"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
          Health
        </span>
      </div>
    </div>
  );
}

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject } = useProjects();
  const project = getProject(projectId);

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Project not found.</p>
        <Link href="/dashboard" className="text-primary text-sm mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Command Center + Sprint Card ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Command Center */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl font-bold text-foreground">
                  Command Center
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary-light text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                  AI Analysis
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed mb-5">
                Your project velocity is trending upwards{" "}
                <span className="text-emerald-600 font-semibold">+12%</span>{" "}
                this sprint. However, code coverage in the{" "}
                <span className="font-semibold text-foreground">
                  Auth Service
                </span>{" "}
                dropped below threshold. Recommend reviewing recent PRs in module{" "}
                <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                  /auth/jwt
                </code>
                .
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
                >
                  View Report
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted border border-border hover:bg-gray-50 transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
            <HealthRing score={HEALTH_SCORE} />
          </div>
        </div>

        {/* Sprint + Incident Cards */}
        <div className="space-y-4">
          {/* Sprint Card */}
          <div className="bg-gradient-to-br from-[#0f1729] to-[#1a2744] rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-slate-400">Sprint 42</span>
            </div>
            <p className="text-3xl font-bold mb-1">42 Points</p>
            <p className="text-sm text-slate-400 mb-4">Velocity on track</p>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: "82%" }}
              />
            </div>
          </div>

          {/* Active Incident */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Active Incident
                </p>
                <p className="font-semibold text-foreground">
                  API Latency Spike
                </p>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted">{stat.label}</p>
                <Icon className="w-4 h-4 text-muted/50" />
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
                {stat.trend && (
                  <span
                    className={`text-xs font-semibold flex items-center gap-0.5 ${
                      stat.trendUp ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {stat.trendUp ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.trend}
                  </span>
                )}
                {stat.sub && (
                  <span className="text-sm text-muted">{stat.sub}</span>
                )}
              </div>

              {/* Detail: bars */}
              {stat.bars && (
                <>
                  <div className="flex gap-1 mt-2 mb-1.5">
                    {stat.bars.map((bar, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full ${bar.color} ${bar.w}`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted">{stat.detail}</p>
                </>
              )}

              {/* Detail: badges */}
              {stat.badges && (
                <div className="flex gap-2 mt-3">
                  {stat.badges.map((b) => (
                    <div key={b.label} className="text-center">
                      <p className="text-[9px] text-muted uppercase mb-0.5">
                        {b.label}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${b.color}`}
                      >
                        {b.grade}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Detail: deploy */}
              {stat.deploy && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[11px] text-muted font-mono">
                    {stat.deploy.version} ({stat.deploy.hash})
                  </span>
                  <span className="text-[11px] text-muted ml-auto">
                    {stat.deploy.time}
                  </span>
                </div>
              )}

              {/* Detail: avatars */}
              {stat.avatars && (
                <>
                  <div className="flex -space-x-1.5 mt-3 mb-2">
                    {stat.avatars.map((a, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-primary-light border-2 border-white flex items-center justify-center"
                      >
                        <span className="text-[8px] font-bold text-primary">
                          {a}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted">{stat.reviewTime}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Deployments + Sprint Velocity ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Deployments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">
              Recent Deployments
            </h3>
            <button className="text-xs font-medium text-primary hover:text-primary-hover transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-1">
            {DEPLOYMENTS.map((dep, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <StatusIcon status={dep.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground truncate">
                      {dep.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${dep.envColor}`}
                    >
                      {dep.env}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    by {dep.author} · {dep.hash} · {dep.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {dep.duration}
                  </p>
                  <p className="text-[11px] text-muted">{dep.durationLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sprint Velocity */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Sprint Velocity</h3>
            <span className="text-xs text-muted">Last 3 Sprints</span>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-3 h-32 mb-4">
            {SPRINTS.map((sprint) => {
              const height = (sprint.value / 50) * 100;
              return (
                <div
                  key={sprint.label}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full relative flex justify-center">
                    <div
                      className={`w-8 rounded-t-lg transition-all duration-500 ${
                        sprint.active ? "bg-primary" : "bg-gray-200"
                      }`}
                      style={{ height: `${height}%`, minHeight: "20px" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between gap-3">
            {SPRINTS.map((sprint) => (
              <div key={sprint.label} className="flex-1 text-center">
                <p
                  className={`text-xs font-medium ${
                    sprint.active ? "text-primary" : "text-muted"
                  }`}
                >
                  {sprint.label}
                </p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted">Avg. Velocity</span>
            <span className="text-sm font-bold text-foreground">38.3 pts</span>
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <div className="text-center py-4">
        <p className="text-xs text-muted">
          CodePolice Intelligence v2.4.0 ·{" "}
          <span className="hover:text-foreground cursor-pointer transition-colors">
            Documentation
          </span>{" "}
          ·{" "}
          <span className="hover:text-foreground cursor-pointer transition-colors">
            Support
          </span>
        </p>
      </div>
    </div>
  );
}
