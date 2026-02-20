// ─── Repository Intelligence Types ──────────────────────────

export type PRStatus = "pending_review" | "approved" | "blocked" | "ready_to_merge" | "merged" | "closed";
export type BranchStatus = "active" | "outdated" | "stale" | "abandoned";
export type CommitTimeCategory = "normal" | "late_night" | "weekend" | "midnight";

// ─── Pull Request ───────────────────────────────────────────

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: ContributorRef;
  status: PRStatus;
  branch: string;
  targetBranch: string;
  createdAt: string;
  updatedAt: string;
  checksStatus: "passing" | "failing" | "pending";
  reviewers: ReviewerAssignment[];
  unresolvedComments: number;
  additions: number;
  deletions: number;
  filesChanged: number;
  labels: string[];
  isDraft: boolean;
  mergedAt?: string;
  closedAt?: string;
  hoursOpen: number;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface ReviewerAssignment {
  reviewer: ContributorRef;
  status: "pending" | "approved" | "changes_requested" | "commented";
  requestedAt: string;
  reviewedAt?: string;
}

// ─── Branch ─────────────────────────────────────────────────

export interface Branch {
  name: string;
  status: BranchStatus;
  lastCommitAt: string;
  lastCommitAuthor: string;
  aheadOf: number;   // commits ahead of main
  behindBy: number;   // commits behind main
  linkedPR?: string;  // PR id
  daysOld: number;
  mergeReadiness: "ready" | "conflicts" | "needs_rebase" | "diverged";
}

// ─── Commit ─────────────────────────────────────────────────

export interface Commit {
  sha: string;
  message: string;
  author: ContributorRef;
  timestamp: string;
  timeCategory: CommitTimeCategory;
  additions: number;
  deletions: number;
  filesChanged: number;
}

// ─── Contributor ────────────────────────────────────────────

export interface ContributorRef {
  id: string;
  name: string;
  avatar: string; // initials
}

export interface ContributorMetric {
  contributor: ContributorRef;
  meaningfulCommits: number;   // non-trivial
  totalCommits: number;
  prsOpened: number;
  prsReviewed: number;
  avgReviewTime: number; // hours
  linesAdded: number;
  linesRemoved: number;
  lateNightCommits: number;
  weekendCommits: number;
  activeDays: number;
  lastActive: string;
  burnoutRisk: "low" | "moderate" | "high";
  streak: number; // consecutive active days
}

// ─── Insights ───────────────────────────────────────────────

export type InsightSeverity = "info" | "warning" | "critical";
export type InsightCategory =
  | "review_bottleneck"
  | "stale_branch"
  | "blocked_pr"
  | "long_lived_branch"
  | "midnight_activity"
  | "deadline_rush"
  | "merge_conflict_risk"
  | "abandoned_work"
  | "productivity_spike"
  | "productivity_drop";

export interface RepoInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  description: string;
  relatedEntityId?: string;
  relatedEntityType?: "pr" | "branch" | "commit" | "contributor";
  timestamp: string;
  actionable: boolean;
  actionLabel?: string;
}

// ─── Daily Activity ─────────────────────────────────────────

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  commits: number;
  prsOpened: number;
  prsMerged: number;
  reviews: number;
}

// ─── Repository Aggregate ───────────────────────────────────

export interface RepositoryIntelligence {
  projectId: string;
  repoName: string;
  repoUrl: string;
  pullRequests: PullRequest[];
  branches: Branch[];
  recentCommits: Commit[];
  contributors: ContributorMetric[];
  insights: RepoInsight[];
  dailyActivity: DailyActivity[];
  lastSyncAt: string;
  syncStatus: "synced" | "syncing" | "error";
}
