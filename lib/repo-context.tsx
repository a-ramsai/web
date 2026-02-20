"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type {
  RepositoryIntelligence,
  PullRequest,
  Branch,
  Commit,
  ContributorMetric,
  RepoInsight,
  DailyActivity,
} from "./repo-types";

// ─── Seed data ──────────────────────────────────────────────

const contributors = {
  sc: { id: "user-sc", name: "Sarah Chen", avatar: "SC" },
  ml: { id: "user-ml", name: "Marcus Li", avatar: "ML" },
  pp: { id: "user-pp", name: "Priya Patel", avatar: "PP" },
  jo: { id: "user-jo", name: "James Oduro", avatar: "JO" },
};

function seedPRs(): PullRequest[] {
  return [
    {
      id: "pr-1", number: 247, title: "feat: implement OAuth2 token refresh", author: contributors.sc,
      status: "pending_review", branch: "feat/oauth-refresh", targetBranch: "main",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      checksStatus: "passing", unresolvedComments: 2, additions: 342, deletions: 89, filesChanged: 12,
      labels: ["auth", "feature"], isDraft: false, hoursOpen: 48, riskLevel: "medium",
      reviewers: [
        { reviewer: contributors.ml, status: "commented", requestedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
        { reviewer: contributors.pp, status: "pending", requestedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      ],
    },
    {
      id: "pr-2", number: 251, title: "fix: rate limiter edge case on /api/v2", author: contributors.ml,
      status: "approved", branch: "fix/rate-limiter", targetBranch: "main",
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      checksStatus: "passing", unresolvedComments: 0, additions: 67, deletions: 23, filesChanged: 4,
      labels: ["bugfix", "api"], isDraft: false, hoursOpen: 24, riskLevel: "low",
      reviewers: [
        { reviewer: contributors.sc, status: "approved", requestedAt: new Date(Date.now() - 86400000).toISOString(), reviewedAt: new Date(Date.now() - 3600000 * 2).toISOString() },
      ],
    },
    {
      id: "pr-3", number: 253, title: "feat: Redis-based caching layer", author: contributors.pp,
      status: "blocked", branch: "feat/redis-cache", targetBranch: "main",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      checksStatus: "failing", unresolvedComments: 7, additions: 891, deletions: 156, filesChanged: 24,
      labels: ["infrastructure", "feature"], isDraft: false, hoursOpen: 120, riskLevel: "critical",
      reviewers: [
        { reviewer: contributors.jo, status: "changes_requested", requestedAt: new Date(Date.now() - 86400000 * 5).toISOString(), reviewedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
        { reviewer: contributors.ml, status: "pending", requestedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      ],
    },
    {
      id: "pr-4", number: 256, title: "refactor: migrate user table schema v2", author: contributors.jo,
      status: "ready_to_merge", branch: "refactor/user-schema-v2", targetBranch: "main",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      checksStatus: "passing", unresolvedComments: 0, additions: 234, deletions: 178, filesChanged: 8,
      labels: ["database", "refactor"], isDraft: false, hoursOpen: 72, riskLevel: "medium",
      reviewers: [
        { reviewer: contributors.sc, status: "approved", requestedAt: new Date(Date.now() - 86400000 * 3).toISOString(), reviewedAt: new Date(Date.now() - 86400000).toISOString() },
        { reviewer: contributors.pp, status: "approved", requestedAt: new Date(Date.now() - 86400000 * 3).toISOString(), reviewedAt: new Date(Date.now() - 3600000 * 4).toISOString() },
      ],
    },
    {
      id: "pr-5", number: 259, title: "feat: Grafana dashboards for Redis monitoring", author: contributors.jo,
      status: "pending_review", branch: "feat/grafana-redis", targetBranch: "main",
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      checksStatus: "pending", unresolvedComments: 0, additions: 156, deletions: 12, filesChanged: 6,
      labels: ["devops", "monitoring"], isDraft: true, hoursOpen: 8, riskLevel: "low",
      reviewers: [],
    },
    {
      id: "pr-6", number: 244, title: "feat: notification system webhooks", author: contributors.ml,
      status: "pending_review", branch: "feat/notify-webhooks", targetBranch: "main",
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      checksStatus: "passing", unresolvedComments: 1, additions: 543, deletions: 67, filesChanged: 18,
      labels: ["feature", "notifications"], isDraft: false, hoursOpen: 168, riskLevel: "high",
      reviewers: [
        { reviewer: contributors.sc, status: "pending", requestedAt: new Date(Date.now() - 86400000 * 7).toISOString() },
      ],
    },
  ];
}

function seedBranches(): Branch[] {
  return [
    { name: "feat/oauth-refresh", status: "active", lastCommitAt: new Date(Date.now() - 3600000 * 6).toISOString(), lastCommitAuthor: "Sarah Chen", aheadOf: 12, behindBy: 3, linkedPR: "pr-1", daysOld: 2, mergeReadiness: "needs_rebase" },
    { name: "fix/rate-limiter", status: "active", lastCommitAt: new Date(Date.now() - 3600000 * 2).toISOString(), lastCommitAuthor: "Marcus Li", aheadOf: 4, behindBy: 0, linkedPR: "pr-2", daysOld: 1, mergeReadiness: "ready" },
    { name: "feat/redis-cache", status: "outdated", lastCommitAt: new Date(Date.now() - 86400000 * 3).toISOString(), lastCommitAuthor: "Priya Patel", aheadOf: 28, behindBy: 15, linkedPR: "pr-3", daysOld: 5, mergeReadiness: "conflicts" },
    { name: "refactor/user-schema-v2", status: "active", lastCommitAt: new Date(Date.now() - 3600000).toISOString(), lastCommitAuthor: "James Oduro", aheadOf: 9, behindBy: 1, linkedPR: "pr-4", daysOld: 3, mergeReadiness: "ready" },
    { name: "feat/grafana-redis", status: "active", lastCommitAt: new Date(Date.now() - 3600000 * 8).toISOString(), lastCommitAuthor: "James Oduro", aheadOf: 3, behindBy: 2, linkedPR: "pr-5", daysOld: 0, mergeReadiness: "needs_rebase" },
    { name: "feat/notify-webhooks", status: "stale", lastCommitAt: new Date(Date.now() - 86400000 * 4).toISOString(), lastCommitAuthor: "Marcus Li", aheadOf: 18, behindBy: 22, linkedPR: "pr-6", daysOld: 7, mergeReadiness: "diverged" },
    { name: "experiment/ml-pipeline", status: "abandoned", lastCommitAt: new Date(Date.now() - 86400000 * 21).toISOString(), lastCommitAuthor: "Priya Patel", aheadOf: 6, behindBy: 45, daysOld: 21, mergeReadiness: "diverged" },
    { name: "hotfix/session-leak", status: "stale", lastCommitAt: new Date(Date.now() - 86400000 * 12).toISOString(), lastCommitAuthor: "Sarah Chen", aheadOf: 2, behindBy: 31, daysOld: 12, mergeReadiness: "needs_rebase" },
  ];
}

function seedCommits(): Commit[] {
  const now = Date.now();
  return [
    { sha: "a1b2c3d", message: "feat: add token refresh endpoint", author: contributors.sc, timestamp: new Date(now - 3600000 * 6).toISOString(), timeCategory: "normal", additions: 89, deletions: 12, filesChanged: 4 },
    { sha: "e4f5g6h", message: "fix: handle edge case in rate limiter", author: contributors.ml, timestamp: new Date(now - 3600000 * 2).toISOString(), timeCategory: "normal", additions: 34, deletions: 11, filesChanged: 2 },
    { sha: "i7j8k9l", message: "test: add integration tests for auth flow", author: contributors.sc, timestamp: new Date(now - 3600000 * 8).toISOString(), timeCategory: "normal", additions: 167, deletions: 0, filesChanged: 3 },
    { sha: "m0n1o2p", message: "refactor: split user service into modules", author: contributors.jo, timestamp: new Date(now - 3600000 * 1).toISOString(), timeCategory: "normal", additions: 45, deletions: 89, filesChanged: 6 },
    { sha: "q3r4s5t", message: "fix: resolve Redis connection pool leak", author: contributors.pp, timestamp: new Date(now - 86400000 * 3).toISOString(), timeCategory: "midnight", additions: 23, deletions: 8, filesChanged: 1 },
    { sha: "u6v7w8x", message: "feat: add Grafana dashboard templates", author: contributors.jo, timestamp: new Date(now - 3600000 * 8).toISOString(), timeCategory: "normal", additions: 156, deletions: 12, filesChanged: 6 },
    { sha: "y9z0a1b", message: "chore: update dependencies", author: contributors.ml, timestamp: new Date(now - 86400000).toISOString(), timeCategory: "late_night", additions: 234, deletions: 198, filesChanged: 2 },
    { sha: "c2d3e4f", message: "docs: updated API documentation for v2", author: contributors.pp, timestamp: new Date(now - 86400000 * 2).toISOString(), timeCategory: "normal", additions: 89, deletions: 23, filesChanged: 5 },
    { sha: "g5h6i7j", message: "feat: webhook payload validation", author: contributors.ml, timestamp: new Date(now - 86400000 * 4).toISOString(), timeCategory: "weekend", additions: 212, deletions: 34, filesChanged: 8 },
    { sha: "k8l9m0n", message: "hotfix: patch session memory leak", author: contributors.sc, timestamp: new Date(now - 86400000 * 1.5).toISOString(), timeCategory: "midnight", additions: 8, deletions: 3, filesChanged: 1 },
  ];
}

function seedContributorMetrics(): ContributorMetric[] {
  return [
    {
      contributor: contributors.sc, meaningfulCommits: 42, totalCommits: 56,
      prsOpened: 8, prsReviewed: 14, avgReviewTime: 4.2, linesAdded: 3420,
      linesRemoved: 1230, lateNightCommits: 3, weekendCommits: 1,
      activeDays: 18, lastActive: new Date(Date.now() - 3600000).toISOString(),
      burnoutRisk: "low", streak: 7,
    },
    {
      contributor: contributors.ml, meaningfulCommits: 38, totalCommits: 61,
      prsOpened: 6, prsReviewed: 9, avgReviewTime: 8.5, linesAdded: 4100,
      linesRemoved: 1890, lateNightCommits: 5, weekendCommits: 4,
      activeDays: 16, lastActive: new Date(Date.now() - 1800000).toISOString(),
      burnoutRisk: "moderate", streak: 12,
    },
    {
      contributor: contributors.pp, meaningfulCommits: 29, totalCommits: 34,
      prsOpened: 5, prsReviewed: 11, avgReviewTime: 3.1, linesAdded: 2100,
      linesRemoved: 670, lateNightCommits: 1, weekendCommits: 0,
      activeDays: 14, lastActive: new Date(Date.now() - 86400000).toISOString(),
      burnoutRisk: "low", streak: 4,
    },
    {
      contributor: contributors.jo, meaningfulCommits: 35, totalCommits: 44,
      prsOpened: 7, prsReviewed: 6, avgReviewTime: 6.3, linesAdded: 2890,
      linesRemoved: 1456, lateNightCommits: 2, weekendCommits: 2,
      activeDays: 15, lastActive: new Date(Date.now() - 3600000 * 2).toISOString(),
      burnoutRisk: "low", streak: 5,
    },
  ];
}

function seedInsights(): RepoInsight[] {
  return [
    {
      id: "ins-1", category: "blocked_pr", severity: "critical",
      title: "PR #253 blocked for 5 days",
      description: "Redis caching layer PR has failing checks and 7 unresolved comments. CI pipeline failure on integration tests.",
      relatedEntityId: "pr-3", relatedEntityType: "pr",
      timestamp: new Date(Date.now() - 3600000).toISOString(), actionable: true, actionLabel: "View PR",
    },
    {
      id: "ins-2", category: "review_bottleneck", severity: "warning",
      title: "Sarah Chen has 3 pending reviews",
      description: "Avg review time has increased to 8.5h this week. Consider redistributing review load.",
      relatedEntityId: "user-sc", relatedEntityType: "contributor",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), actionable: true, actionLabel: "Reassign",
    },
    {
      id: "ins-3", category: "stale_branch", severity: "warning",
      title: "2 branches have no activity for 7+ days",
      description: "feat/notify-webhooks and hotfix/session-leak are falling behind main. Risk of merge conflicts increasing.",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), actionable: true, actionLabel: "Review branches",
    },
    {
      id: "ins-4", category: "midnight_activity", severity: "warning",
      title: "Late-night commits detected",
      description: "Marcus Li made 5 late-night commits this sprint. Sarah Chen had 2 midnight hotfixes. Potential burnout or deadline rush.",
      relatedEntityType: "contributor",
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), actionable: false,
    },
    {
      id: "ins-5", category: "abandoned_work", severity: "info",
      title: "Abandoned branch: experiment/ml-pipeline",
      description: "No commits in 21 days. 6 commits ahead, 45 behind main. Consider archiving or deleting.",
      relatedEntityType: "branch",
      timestamp: new Date(Date.now() - 86400000).toISOString(), actionable: true, actionLabel: "Archive",
    },
    {
      id: "ins-6", category: "long_lived_branch", severity: "warning",
      title: "PR #244 open for 7 days without merge",
      description: "Notification webhooks feature branch is diverging significantly (22 commits behind). Merge conflicts likely.",
      relatedEntityId: "pr-6", relatedEntityType: "pr",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), actionable: true, actionLabel: "View PR",
    },
    {
      id: "ins-7", category: "productivity_spike", severity: "info",
      title: "James Oduro on a 5-day streak",
      description: "35 meaningful commits, 7 PRs opened. Highest output contributor this sprint.",
      relatedEntityId: "user-jo", relatedEntityType: "contributor",
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), actionable: false,
    },
  ];
}

function seedDailyActivity(): DailyActivity[] {
  const days: DailyActivity[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - 86400000 * i);
    const date = d.toISOString().split("T")[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    days.push({
      date,
      commits: isWeekend ? Math.floor(Math.random() * 4) : 4 + Math.floor(Math.random() * 10),
      prsOpened: Math.floor(Math.random() * 3),
      prsMerged: Math.floor(Math.random() * 2),
      reviews: 1 + Math.floor(Math.random() * 5),
    });
  }
  return days;
}

// ─── Context ────────────────────────────────────────────────

interface RepoContextType {
  data: RepositoryIntelligence;
  refreshSync: () => void;
}

const defaultData: RepositoryIntelligence = {
  projectId: "demo-1",
  repoName: "codestyle-policeman/core",
  repoUrl: "https://github.com/codestyle-policeman/core",
  pullRequests: seedPRs(),
  branches: seedBranches(),
  recentCommits: seedCommits(),
  contributors: seedContributorMetrics(),
  insights: seedInsights(),
  dailyActivity: seedDailyActivity(),
  lastSyncAt: new Date().toISOString(),
  syncStatus: "synced",
};

const RepoContext = createContext<RepoContextType>({
  data: defaultData,
  refreshSync: () => {},
});

export function RepoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RepositoryIntelligence>(defaultData);

  const refreshSync = useCallback(() => {
    setData((prev) => ({
      ...prev,
      syncStatus: "syncing" as const,
      lastSyncAt: new Date().toISOString(),
    }));
    setTimeout(() => {
      setData((prev) => ({ ...prev, syncStatus: "synced" as const }));
    }, 1500);
  }, []);

  return (
    <RepoContext.Provider value={{ data, refreshSync }}>
      {children}
    </RepoContext.Provider>
  );
}

export function useRepo() {
  return useContext(RepoContext);
}
