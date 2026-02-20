// ─── Chat Entities ──────────────────────────────────────────

export type MessageRole = "user" | "ai" | "system";
export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type InsightType = "decision" | "task" | "risk" | "duplicate" | "summary";

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO
  threadId?: string; // parent message id for threads
  replyCount?: number;
  reactions?: Record<string, string[]>; // emoji → userId[]
  extractedInsights?: string[]; // insight ids derived from this msg
}

export interface DecisionLog {
  id: string;
  projectId: string;
  summary: string;
  participants: string[];
  relatedModule?: string;
  relatedTaskId?: string;
  sourceMessageIds: string[];
  timestamp: string;
  status: "confirmed" | "pending" | "revised";
}

export interface DiscussionHighlight {
  id: string;
  projectId: string;
  type: "resolved" | "agreed" | "pending_question" | "blocker";
  summary: string;
  sourceMessageIds: string[];
  timestamp: string;
}

export interface ExtractedTask {
  id: string;
  projectId: string;
  title: string;
  sourceMessageId: string;
  sourceText: string;
  suggestedAssignee?: string;
  assigneeId?: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high" | "critical";
  chatReference: string; // message id
  createdAt: string;
  confirmedAt?: string;
  duplicateOf?: string; // task id if duplicate detected
}

export interface MemberProgress {
  memberId: string;
  memberName: string;
  avatar: string;
  assignedTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  completionPct: number;
  lastActive: string;
  isActive: boolean;
  contributions: number; // messages sent
}

export interface ChatInsight {
  id: string;
  projectId: string;
  type: InsightType;
  content: string;
  severity?: "info" | "warning" | "critical";
  relatedEntityId?: string;
  timestamp: string;
}

// ─── AI Pipeline Events ────────────────────────────────────

export interface AIPipelineEvent {
  type: "message_received" | "analysis_started" | "insight_generated" | "task_detected" | "duplicate_found";
  payload: unknown;
  timestamp: string;
}
