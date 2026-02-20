"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/lib/project-context";
import {
  AlertCircle,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  GitBranch,
  Link2,
  Flame,
  Bug,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────

type IssueStatus = "open" | "in_progress" | "resolved" | "closed";
type IssuePriority = "critical" | "high" | "medium" | "low";
type IssueType = "bug" | "feature" | "improvement" | "task";
type SortField = "created" | "priority" | "updated";

interface IssueLabel {
  name: string;
  color: string;
}

interface Issue {
  id: string;
  number: number;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assignee: string;
  assigneeAvatar: string;
  reporter: string;
  labels: IssueLabel[];
  comments: number;
  linkedBranch?: string;
  linkedPR?: number;
  createdAt: string;
  updatedAt: string;
  milestone?: string;
}

// ─── Seed Data ──────────────────────────────────────────────

const ISSUES: Issue[] = [
  {
    id: "i1", number: 142, title: "Payment gateway timeout on large transactions",
    description: "Transactions over $500 are timing out after 30s. The Stripe webhook isn't receiving confirmation callbacks for these amounts.",
    status: "open", priority: "critical", type: "bug",
    assignee: "Marcus Li", assigneeAvatar: "ML", reporter: "Sarah Chen",
    labels: [{ name: "backend", color: "#2563eb" }, { name: "payments", color: "#dc2626" }],
    comments: 8, linkedBranch: "fix/payment-timeout", linkedPR: 312,
    createdAt: "2026-02-18T09:30:00Z", updatedAt: "2026-02-20T14:15:00Z", milestone: "Sprint 2",
  },
  {
    id: "i2", number: 139, title: "OAuth2 token refresh fails silently",
    description: "When the access token expires, the refresh flow doesn't propagate new tokens to the client. Users get logged out unexpectedly.",
    status: "in_progress", priority: "critical", type: "bug",
    assignee: "Sarah Chen", assigneeAvatar: "SC", reporter: "Priya Patel",
    labels: [{ name: "auth", color: "#7c3aed" }, { name: "frontend", color: "#06b6d4" }],
    comments: 12, linkedBranch: "fix/token-refresh",
    createdAt: "2026-02-16T11:00:00Z", updatedAt: "2026-02-20T10:30:00Z", milestone: "Sprint 2",
  },
  {
    id: "i3", number: 137, title: "Redis connection pool leak under load",
    description: "Connection pool exhausts after ~2 hours of sustained traffic. Monitoring shows connections aren't being released after cache reads.",
    status: "in_progress", priority: "high", type: "bug",
    assignee: "Priya Patel", assigneeAvatar: "PP", reporter: "James Oduro",
    labels: [{ name: "infrastructure", color: "#64748b" }, { name: "performance", color: "#f59e0b" }],
    comments: 6, linkedBranch: "fix/redis-pool-leak", linkedPR: 253,
    createdAt: "2026-02-15T14:20:00Z", updatedAt: "2026-02-19T16:45:00Z",
  },
  {
    id: "i4", number: 135, title: "Add real-time notifications via WebSocket",
    description: "Implement WebSocket-based push notifications for mentions, PR reviews, and deployment status. Should integrate with the existing notification bell.",
    status: "open", priority: "high", type: "feature",
    assignee: "Marcus Li", assigneeAvatar: "ML", reporter: "Sarah Chen",
    labels: [{ name: "backend", color: "#2563eb" }, { name: "feature", color: "#10b981" }],
    comments: 15, linkedBranch: "feature/notifications",
    createdAt: "2026-02-14T08:00:00Z", updatedAt: "2026-02-19T09:30:00Z", milestone: "Sprint 3",
  },
  {
    id: "i5", number: 131, title: "Dashboard widgets don't persist layout on refresh",
    description: "Custom widget arrangements on the dashboard reset to default after page refresh. Need to persist layout to localStorage or backend.",
    status: "open", priority: "medium", type: "bug",
    assignee: "Sarah Chen", assigneeAvatar: "SC", reporter: "Marcus Li",
    labels: [{ name: "frontend", color: "#06b6d4" }, { name: "UX", color: "#ec4899" }],
    comments: 3,
    createdAt: "2026-02-12T10:15:00Z", updatedAt: "2026-02-18T11:00:00Z",
  },
  {
    id: "i6", number: 128, title: "Implement role-based access control (RBAC)",
    description: "Add granular permission system: Admin, Maintainer, Developer, Viewer roles. Should control sidebar visibility, write access, and settings.",
    status: "open", priority: "high", type: "feature",
    assignee: "James Oduro", assigneeAvatar: "JO", reporter: "Priya Patel",
    labels: [{ name: "auth", color: "#7c3aed" }, { name: "feature", color: "#10b981" }, { name: "backend", color: "#2563eb" }],
    comments: 21,
    createdAt: "2026-02-10T09:00:00Z", updatedAt: "2026-02-17T14:00:00Z", milestone: "Sprint 3",
  },
  {
    id: "i7", number: 126, title: "Add dark mode toggle to settings",
    description: "Users should be able to switch between light and dark themes. Theme preference should persist across sessions.",
    status: "open", priority: "low", type: "improvement",
    assignee: "Sarah Chen", assigneeAvatar: "SC", reporter: "James Oduro",
    labels: [{ name: "frontend", color: "#06b6d4" }, { name: "UX", color: "#ec4899" }],
    comments: 5,
    createdAt: "2026-02-09T13:30:00Z", updatedAt: "2026-02-15T16:00:00Z",
  },
  {
    id: "i8", number: 124, title: "E2e test suite flaky on payment flow",
    description: "Cypress tests for the payment checkout randomly fail. Suspected race condition in test teardown — assertions fire before DB rollback completes.",
    status: "open", priority: "medium", type: "bug",
    assignee: "James Oduro", assigneeAvatar: "JO", reporter: "Marcus Li",
    labels: [{ name: "testing", color: "#f97316" }, { name: "CI/CD", color: "#64748b" }],
    comments: 4, linkedBranch: "fix/e2e-payment-flake",
    createdAt: "2026-02-08T15:00:00Z", updatedAt: "2026-02-16T08:30:00Z",
  },
  {
    id: "i9", number: 121, title: "API rate limiting not enforced on batch endpoints",
    description: "The /api/batch/* endpoints bypass the global rate limiter. Need to apply per-IP and per-token limits to all batch routes.",
    status: "resolved", priority: "high", type: "bug",
    assignee: "Priya Patel", assigneeAvatar: "PP", reporter: "Sarah Chen",
    labels: [{ name: "backend", color: "#2563eb" }, { name: "security", color: "#dc2626" }],
    comments: 9, linkedPR: 308,
    createdAt: "2026-02-06T10:00:00Z", updatedAt: "2026-02-14T17:00:00Z", milestone: "Sprint 2",
  },
  {
    id: "i10", number: 118, title: "Optimize Docker build — reduce image size by 40%",
    description: "Current production image is 1.2 GB. Target: multi-stage build, strip dev deps, use alpine base. Expected result ~720 MB.",
    status: "resolved", priority: "medium", type: "improvement",
    assignee: "James Oduro", assigneeAvatar: "JO", reporter: "Priya Patel",
    labels: [{ name: "DevOps", color: "#64748b" }, { name: "performance", color: "#f59e0b" }],
    comments: 7, linkedPR: 295,
    createdAt: "2026-02-04T11:15:00Z", updatedAt: "2026-02-12T09:45:00Z",
  },
  {
    id: "i11", number: 115, title: "Add webhook payload validation middleware",
    description: "Incoming webhooks from GitHub and Stripe lack schema validation. Add JSON schema validation middleware for all webhook endpoints.",
    status: "in_progress", priority: "medium", type: "task",
    assignee: "Marcus Li", assigneeAvatar: "ML", reporter: "James Oduro",
    labels: [{ name: "backend", color: "#2563eb" }, { name: "security", color: "#dc2626" }],
    comments: 2, linkedBranch: "feature/webhook-validation",
    createdAt: "2026-02-03T14:00:00Z", updatedAt: "2026-02-18T13:20:00Z", milestone: "Sprint 2",
  },
  {
    id: "i12", number: 112, title: "Migrate database to connection pooling with PgBouncer",
    description: "Direct Postgres connections are exhausting under load. Set up PgBouncer for connection pooling and update ORM configuration.",
    status: "closed", priority: "high", type: "improvement",
    assignee: "Priya Patel", assigneeAvatar: "PP", reporter: "Marcus Li",
    labels: [{ name: "database", color: "#8b5cf6" }, { name: "infrastructure", color: "#64748b" }],
    comments: 11, linkedPR: 280,
    createdAt: "2026-02-01T09:00:00Z", updatedAt: "2026-02-10T15:00:00Z", milestone: "Sprint 1",
  },
  {
    id: "i13", number: 108, title: "Write API documentation for v2 endpoints",
    description: "v2 API endpoints lack OpenAPI documentation. Generate Swagger docs and publish to /api/docs for team and external consumers.",
    status: "open", priority: "medium", type: "task",
    assignee: "Priya Patel", assigneeAvatar: "PP", reporter: "Sarah Chen",
    labels: [{ name: "documentation", color: "#0ea5e9" }, { name: "backend", color: "#2563eb" }],
    comments: 1,
    createdAt: "2026-01-28T10:30:00Z", updatedAt: "2026-02-13T14:00:00Z",
  },
  {
    id: "i14", number: 105, title: "Set up staging environment with seed data",
    description: "Staging env needs to mirror production schema with anonymized seed data. Include CI pipeline for auto-deploy on merge to develop.",
    status: "closed", priority: "medium", type: "task",
    assignee: "James Oduro", assigneeAvatar: "JO", reporter: "Priya Patel",
    labels: [{ name: "DevOps", color: "#64748b" }, { name: "CI/CD", color: "#64748b" }],
    comments: 6, linkedPR: 267,
    createdAt: "2026-01-25T08:00:00Z", updatedAt: "2026-02-05T12:00:00Z", milestone: "Sprint 1",
  },
];

// ─── Config ─────────────────────────────────────────────────

const STATUS_CONFIG: Record<IssueStatus, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  open: { label: "Open", icon: Circle, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
  closed: { label: "Closed", icon: XCircle, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
};

const PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string; bg: string; border: string; dot: string }> = {
  critical: { label: "Critical", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
  high: { label: "High", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  medium: { label: "Medium", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  low: { label: "Low", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
};

const TYPE_CONFIG: Record<IssueType, { label: string; icon: React.ElementType; color: string }> = {
  bug: { label: "Bug", icon: Bug, color: "text-red-600" },
  feature: { label: "Feature", icon: Lightbulb, color: "text-violet-600" },
  improvement: { label: "Improvement", icon: ArrowUpRight, color: "text-blue-600" },
  task: { label: "Task", icon: CheckCircle2, color: "text-emerald-600" },
};

// ─── Component ──────────────────────────────────────────────

export default function IssuesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject } = useProjects();
  const project = getProject(projectId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | "all">("all");
  const [typeFilter, setTypeFilter] = useState<IssueType | "all">("all");
  const [sortField, setSortField] = useState<SortField>("updated");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const formatRelative = useCallback((iso: string) => {
    const now = performance.timeOrigin + performance.now();
    const ms = now - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  }, []);

  const filtered = useMemo(() => {
    let list = [...ISSUES];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || `#${i.number}`.includes(q));
    }
    if (statusFilter !== "all") list = list.filter((i) => i.status === statusFilter);
    if (priorityFilter !== "all") list = list.filter((i) => i.priority === priorityFilter);
    if (typeFilter !== "all") list = list.filter((i) => i.type === typeFilter);

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "created") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === "updated") cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      else {
        const order: IssuePriority[] = ["critical", "high", "medium", "low"];
        cmp = order.indexOf(a.priority) - order.indexOf(b.priority);
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [search, statusFilter, priorityFilter, typeFilter, sortField, sortAsc]);

  const statusCounts = useMemo(() => ({
    all: ISSUES.length,
    open: ISSUES.filter((i) => i.status === "open").length,
    in_progress: ISSUES.filter((i) => i.status === "in_progress").length,
    resolved: ISSUES.filter((i) => i.status === "resolved").length,
    closed: ISSUES.filter((i) => i.status === "closed").length,
  }), []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  return (
    <div className="max-w-350 mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-primary" />
            Issues
          </h1>
          <p className="text-sm text-muted mt-1">
            Track and manage bugs, features, and tasks for {project?.name || "this project"}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          New Issue
        </button>
      </div>

      {/* ── Status Tabs ── */}
      <div className="flex items-center gap-1 border-b border-border">
        {(["all", "open", "in_progress", "resolved", "closed"] as const).map((s) => {
          const label = s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                statusFilter === s ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === s ? "bg-primary/10 text-primary" : "bg-gray-100 text-muted"}`}>
                {statusCounts[s]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Filters + Search ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search issues by title, description, or #number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg bg-white border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as IssuePriority | "all")}
          className="px-3 py-2.5 text-sm rounded-lg bg-white border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as IssueType | "all")}
          className="px-3 py-2.5 text-sm rounded-lg bg-white border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Types</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="improvement">Improvement</option>
          <option value="task">Task</option>
        </select>
        <div className="flex items-center gap-1 bg-white border border-border rounded-lg overflow-hidden">
          {(["updated", "created", "priority"] as SortField[]).map((f) => (
            <button
              key={f}
              onClick={() => toggleSort(f)}
              className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1 ${
                sortField === f ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              {f === "updated" ? "Updated" : f === "created" ? "Created" : "Priority"}
              {sortField === f && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Issues List ── */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <AlertCircle className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No issues match your filters.</p>
          </div>
        )}
        {filtered.map((issue) => {
          const scfg = STATUS_CONFIG[issue.status];
          const pcfg = PRIORITY_CONFIG[issue.priority];
          const tcfg = TYPE_CONFIG[issue.type];
          const TIcon = tcfg.icon;
          const SIcon = scfg.icon;
          const isExpanded = expandedIssue === issue.id;

          return (
            <div key={issue.id} className={`bg-white rounded-xl border overflow-hidden transition-colors ${issue.priority === "critical" ? "border-red-200" : "border-border"} hover:border-primary/30`}>
              <button
                onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                className="w-full flex items-start gap-4 px-5 py-4 text-left cursor-pointer"
              >
                {/* Status icon */}
                <SIcon className={`w-5 h-5 mt-0.5 shrink-0 ${scfg.color}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs text-muted font-mono">#{issue.number}</span>
                    <h4 className="text-sm font-semibold text-foreground">{issue.title}</h4>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${pcfg.bg} ${pcfg.border} ${pcfg.color}`}>{pcfg.label}</span>
                    <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-50 border border-border ${tcfg.color}`}>
                      <TIcon className="w-2.5 h-2.5" />
                      {tcfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted mt-1">
                    <span className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[7px] font-bold text-primary">{issue.assigneeAvatar}</span>
                      </div>
                      {issue.assignee}
                    </span>
                    {issue.labels.map((l) => (
                      <span key={l.name} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                        {l.name}
                      </span>
                    ))}
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {issue.comments}
                    </span>
                    <span>{formatRelative(issue.updatedAt)}</span>
                  </div>
                </div>

                {/* Expand indicator */}
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted mt-1 shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted mt-1 shrink-0" />}
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 pb-4 border-t border-border bg-gray-50/30 pt-3 ml-9">
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">{issue.description}</p>
                  <div className="flex items-center gap-4 flex-wrap text-xs">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${scfg.bg} ${scfg.color} font-medium border ${scfg.border}`}>
                      <SIcon className="w-3 h-3" />
                      {scfg.label}
                    </span>
                    {issue.linkedBranch && (
                      <span className="flex items-center gap-1 text-muted">
                        <GitBranch className="w-3 h-3" />
                        {issue.linkedBranch}
                      </span>
                    )}
                    {issue.linkedPR && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Link2 className="w-3 h-3" />
                        PR #{issue.linkedPR}
                      </span>
                    )}
                    {issue.milestone && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        <Flame className="w-3 h-3" />
                        {issue.milestone}
                      </span>
                    )}
                    <span className="text-muted">Reported by {issue.reporter}</span>
                    <span className="text-muted">Created {formatRelative(issue.createdAt)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Summary bar ── */}
      <div className="bg-white rounded-xl border border-border p-4 flex items-center justify-between text-xs text-muted">
        <span>Showing {filtered.length} of {ISSUES.length} issues</span>
        <div className="flex items-center gap-4">
          {(["critical", "high", "medium", "low"] as IssuePriority[]).map((p) => {
            const cnt = ISSUES.filter((i) => i.priority === p).length;
            const cfg = PRIORITY_CONFIG[p];
            return (
              <span key={p} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cnt} {cfg.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
