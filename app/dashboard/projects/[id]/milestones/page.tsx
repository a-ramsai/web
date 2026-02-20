"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/lib/project-context";
import {
  Flag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  CalendarDays,
  Target,
  Zap,
  TrendingUp,
  PartyPopper,
  Circle,
} from "lucide-react";
import { useState } from "react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: "completed" | "in-progress" | "at-risk" | "upcoming";
  completionPct: number;
  features: Feature[];
}

interface Feature {
  id: string;
  name: string;
  done: boolean;
}

const initialMilestones: Milestone[] = [
  {
    id: "M-1",
    title: "MVP Launch",
    description: "Core functionality ready for beta users",
    deadline: "2026-02-15",
    status: "completed",
    completionPct: 100,
    features: [
      { id: "f1", name: "User authentication flow", done: true },
      { id: "f2", name: "Core API endpoints", done: true },
      { id: "f3", name: "Basic dashboard UI", done: true },
      { id: "f4", name: "Database schema v1", done: true },
    ],
  },
  {
    id: "M-2",
    title: "Sprint 2 — Advanced Features",
    description: "Team collaboration, notifications, and analytics",
    deadline: "2026-02-28",
    status: "in-progress",
    completionPct: 62,
    features: [
      { id: "f5", name: "Team invitation system", done: true },
      { id: "f6", name: "Real-time notifications", done: true },
      { id: "f7", name: "Analytics dashboard", done: false },
      { id: "f8", name: "Role-based access control", done: true },
      { id: "f9", name: "Webhook integrations", done: false },
      { id: "f10", name: "Activity feed", done: false },
    ],
  },
  {
    id: "M-3",
    title: "Demo Day Preparation",
    description: "Polish, performance, and demo script finalization",
    deadline: "2026-03-05",
    status: "at-risk",
    completionPct: 25,
    features: [
      { id: "f11", name: "Performance optimization", done: true },
      { id: "f12", name: "Demo script & walkthrough", done: false },
      { id: "f13", name: "Load testing", done: false },
      { id: "f14", name: "Bug bash — critical fixes", done: false },
    ],
  },
  {
    id: "M-4",
    title: "Public Beta Release",
    description: "Open access with onboarding, docs, and support",
    deadline: "2026-03-20",
    status: "upcoming",
    completionPct: 0,
    features: [
      { id: "f15", name: "Onboarding wizard", done: false },
      { id: "f16", name: "Public documentation site", done: false },
      { id: "f17", name: "Support ticket system", done: false },
      { id: "f18", name: "Billing & subscription flow", done: false },
    ],
  },
];

const statusConfig: Record<
  Milestone["status"],
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  "in-progress": { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Clock },
  "at-risk": { label: "At Risk", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: AlertTriangle },
  upcoming: { label: "Upcoming", color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: Circle },
};

export default function MilestonesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject } = useProjects();
  const project = getProject(projectId);

  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [expandedId, setExpandedId] = useState<string | null>("M-2");

  const toggleFeature = (milestoneId: string, featureId: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        const updatedFeatures = m.features.map((f) =>
          f.id === featureId ? { ...f, done: !f.done } : f
        );
        const doneCount = updatedFeatures.filter((f) => f.done).length;
        const pct = Math.round((doneCount / updatedFeatures.length) * 100);
        return { ...m, features: updatedFeatures, completionPct: pct };
      })
    );
  };

  const totalFeatures = milestones.reduce((a, m) => a + m.features.length, 0);
  const doneFeatures = milestones.reduce((a, m) => a + m.features.filter((f) => f.done).length, 0);
  const overallPct = Math.round((doneFeatures / totalFeatures) * 100);
  const completedMilestones = milestones.filter((m) => m.completionPct === 100).length;
  const atRiskCount = milestones.filter((m) => m.status === "at-risk").length;

  // Demo readiness
  const demoMilestone = milestones.find((m) => m.title.toLowerCase().includes("demo"));
  const demoReadiness = demoMilestone ? demoMilestone.completionPct : 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Milestones</h1>
        <p className="text-sm text-muted mt-1">
          Feature deadlines, demo readiness &amp; completion tracking for {project?.name || "this project"}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm text-muted mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            Overall Progress
          </div>
          <p className="text-2xl font-bold text-foreground">{overallPct}%</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${overallPct}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm text-muted mb-1">
            <Target className="w-4 h-4 text-emerald-500" />
            Milestones Done
          </div>
          <p className="text-2xl font-bold text-foreground">
            {completedMilestones}<span className="text-sm font-normal text-muted">/{milestones.length}</span>
          </p>
          <p className="text-xs text-muted mt-1">{doneFeatures} of {totalFeatures} features shipped</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm text-muted mb-1">
            <PartyPopper className="w-4 h-4 text-purple-500" />
            Demo Readiness
          </div>
          <p className="text-2xl font-bold text-foreground">{demoReadiness}%</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
            <div
              className={`h-full rounded-full transition-all ${demoReadiness >= 75 ? "bg-emerald-500" : demoReadiness >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${demoReadiness}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm text-muted mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            At Risk
          </div>
          <p className="text-2xl font-bold text-foreground">{atRiskCount}</p>
          <p className="text-xs text-muted mt-1">{atRiskCount > 0 ? "Needs attention" : "All on track"}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {milestones.map((milestone, idx) => {
          const cfg = statusConfig[milestone.status];
          const StatusIcon = cfg.icon;
          const isExpanded = expandedId === milestone.id;
          const doneCount = milestone.features.filter((f) => f.done).length;
          const isPast = new Date(milestone.deadline) < new Date();

          return (
            <div key={milestone.id} className="bg-white rounded-2xl border border-border overflow-hidden">
              {/* Milestone Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : milestone.id)}
                className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center self-stretch">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    milestone.status === "completed"
                      ? "bg-emerald-50 border-emerald-300"
                      : milestone.status === "in-progress"
                      ? "bg-blue-50 border-blue-300"
                      : milestone.status === "at-risk"
                      ? "bg-red-50 border-red-300"
                      : "bg-gray-50 border-gray-300"
                  }`}>
                    <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  {idx < milestones.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold text-foreground">{milestone.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color} uppercase`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{milestone.description}</p>
                </div>

                {/* Right side stats */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  {/* Completion ring */}
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke={milestone.status === "completed" ? "#10b981" : milestone.status === "at-risk" ? "#ef4444" : "#2563eb"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${(milestone.completionPct / 100) * 125.6} 125.6`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                      {milestone.completionPct}%
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-sm text-muted">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {new Date(milestone.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {doneCount}/{milestone.features.length} features
                    </p>
                  </div>

                  <ChevronRight className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </button>

              {/* Expanded Features */}
              {isExpanded && (
                <div className="border-t border-border px-6 py-4 bg-gray-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Feature Checklist</h4>
                    <span className="text-xs text-muted">{doneCount} of {milestone.features.length} complete</span>
                  </div>
                  <div className="space-y-2">
                    {milestone.features.map((feature) => (
                      <label
                        key={feature.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white transition-colors cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={feature.done}
                          onChange={() => toggleFeature(milestone.id, feature.id)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
                        />
                        <span className={`text-sm ${feature.done ? "line-through text-muted" : "text-foreground"}`}>
                          {feature.name}
                        </span>
                        {feature.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                      </label>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                      <span>Progress</span>
                      <span className="font-semibold">{milestone.completionPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full transition-all ${
                          milestone.completionPct === 100
                            ? "bg-emerald-500"
                            : milestone.status === "at-risk"
                            ? "bg-red-500"
                            : "bg-primary"
                        }`}
                        style={{ width: `${milestone.completionPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
