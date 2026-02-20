"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  ChatMessage,
  DecisionLog,
  DiscussionHighlight,
  ExtractedTask,
  MemberProgress,
  ChatInsight,
  TaskStatus,
} from "./chat-types";

// ─── Task Detection (pattern-based) ─────────────────────────

const TASK_PATTERNS = [
  /I(?:'ll| will) (?:handle|take care of|work on|fix|implement|build|create|write|set up|deploy)\s+(.+)/i,
  /(?:need|needs|have) to\s+(.+)/i,
  /(?:we|i) should\s+(.+)/i,
  /(?:TODO|FIXME|HACK)[\s:]+(.+)/i,
  /(?:can you|could you|please)\s+(.+)/i,
  /(?:let(?:'s| us))\s+(.+)/i,
  /(?:assign|assigned)\s+(.+?)\s+to/i,
];

const DECISION_PATTERNS = [
  /(?:decided|agreed|finalized|confirmed|going with|let's go with)\s+(.+)/i,
  /(?:the plan is|approach will be|we'll use|switching to)\s+(.+)/i,
];

function detectTasks(content: string): string | null {
  for (const pattern of TASK_PATTERNS) {
    const match = content.match(pattern);
    if (match) return match[1].replace(/[.!?]+$/, "").trim();
  }
  return null;
}

function detectDecision(content: string): string | null {
  for (const pattern of DECISION_PATTERNS) {
    const match = content.match(pattern);
    if (match) return match[1].replace(/[.!?]+$/, "").trim();
  }
  return null;
}

// ─── AI Response Generator ──────────────────────────────────

const AI_CONTEXTUAL_RESPONSES: Record<string, string[]> = {
  auth: [
    "Based on the project history, the auth module has 3 open tasks. Sarah Chen has the most context here.",
    "The OAuth2 token refresh flow is currently in progress (OP-101). Consider coordinating with the backend team.",
  ],
  deploy: [
    "Last deployment was 2 days ago. The staging environment Dockerization (OP-106) is complete.",
    "I'd recommend running the full e2e test suite before deploying. The CI pipeline is ready (OP-108).",
  ],
  bug: [
    "There are currently 14 open issues. The rate limiter edge case (OP-102) is high priority.",
    "I've detected a potential duplicate — check if this relates to existing issue OP-102.",
  ],
  frontend: [
    "The design system color token update (OP-105) is still in the backlog. Low priority for now.",
    "Frontend auth is dependent on the backend API. Current blocker: OAuth2 token refresh.",
  ],
  test: [
    "Unit tests for the payment module (OP-103) are allocated 8 story points this sprint.",
    "The CI pipeline for e2e tests is done. Consider adding coverage thresholds.",
  ],
  default: [
    "I've analyzed the discussion. No immediate action items detected, but I'm tracking the context.",
    "Noted. I'll flag this if it connects to any open tasks or decisions.",
    "Good point. This aligns with the current sprint goals. I'll keep monitoring.",
  ],
};

function generateAIResponse(content: string): string {
  const lower = content.toLowerCase();
  for (const [keyword, responses] of Object.entries(AI_CONTEXTUAL_RESPONSES)) {
    if (keyword !== "default" && lower.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  return AI_CONTEXTUAL_RESPONSES.default[
    Math.floor(Math.random() * AI_CONTEXTUAL_RESPONSES.default.length)
  ];
}

// ─── Seed Data ──────────────────────────────────────────────

function seedMessages(projectId: string): ChatMessage[] {
  return [
    {
      id: "msg-1",
      projectId,
      senderId: "user-sc",
      senderName: "Sarah Chen",
      senderAvatar: "SC",
      role: "user",
      content: "I'll handle the OAuth2 token refresh flow this sprint. Already started reviewing the RFC.",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      reactions: { "👍": ["user-ml", "user-pp"] },
    },
    {
      id: "msg-2",
      projectId,
      senderId: "ai",
      senderName: "CodePolice AI",
      role: "ai",
      content: "📋 Task detected: \"Handle OAuth2 token refresh flow\" — Suggested assignee: Sarah Chen (auth domain expert). I've added this to the extraction queue.",
      timestamp: new Date(Date.now() - 3600000 * 4.9).toISOString(),
    },
    {
      id: "msg-3",
      projectId,
      senderId: "user-ml",
      senderName: "Marcus Li",
      senderAvatar: "ML",
      role: "user",
      content: "Found a rate limiter edge case on /api/v2. Need to fix it before next deployment.",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "msg-4",
      projectId,
      senderId: "user-pp",
      senderName: "Priya Patel",
      senderAvatar: "PP",
      role: "user",
      content: "Agreed — let's go with Redis-based rate limiting instead of in-memory. It'll scale better across instances.",
      timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    },
    {
      id: "msg-5",
      projectId,
      senderId: "ai",
      senderName: "CodePolice AI",
      role: "ai",
      content: "🔔 Decision logged: \"Use Redis-based rate limiting instead of in-memory\" — Participants: Marcus Li, Priya Patel. This affects the API module.",
      timestamp: new Date(Date.now() - 3600000 * 3.4).toISOString(),
    },
    {
      id: "msg-6",
      projectId,
      senderId: "user-jo",
      senderName: "James Oduro",
      senderAvatar: "JO",
      role: "user",
      content: "I should set up monitoring dashboards for the new Redis instances. Can someone review the Grafana config?",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "msg-7",
      projectId,
      senderId: "user-sc",
      senderName: "Sarah Chen",
      senderAvatar: "SC",
      role: "user",
      content: "Frontend auth is blocked on the backend API — @Marcus can you prioritize the token endpoint?",
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: "msg-8",
      projectId,
      senderId: "ai",
      senderName: "CodePolice AI",
      role: "ai",
      content: "⚠️ Blocker detected: Frontend auth depends on backend token endpoint. This is a cross-team dependency. I've flagged it in the risk tracker.",
      timestamp: new Date(Date.now() - 3600000 * 0.9).toISOString(),
    },
  ];
}

function seedDecisions(projectId: string): DecisionLog[] {
  return [
    {
      id: "dec-1",
      projectId,
      summary: "Use Redis-based rate limiting instead of in-memory for /api/v2",
      participants: ["Marcus Li", "Priya Patel"],
      relatedModule: "API / Infrastructure",
      sourceMessageIds: ["msg-3", "msg-4"],
      timestamp: new Date(Date.now() - 3600000 * 3.4).toISOString(),
      status: "confirmed",
    },
    {
      id: "dec-2",
      projectId,
      summary: "Prioritize OAuth2 token refresh in current sprint",
      participants: ["Sarah Chen"],
      relatedModule: "Auth",
      sourceMessageIds: ["msg-1"],
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: "confirmed",
    },
    {
      id: "dec-3",
      projectId,
      summary: "Add Grafana monitoring for Redis instances before production deploy",
      participants: ["James Oduro"],
      relatedModule: "DevOps",
      sourceMessageIds: ["msg-6"],
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "pending",
    },
  ];
}

function seedHighlights(projectId: string): DiscussionHighlight[] {
  return [
    {
      id: "hl-1",
      projectId,
      type: "resolved",
      summary: "Rate limiting approach decided — moving to Redis-based solution",
      sourceMessageIds: ["msg-3", "msg-4"],
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: "hl-2",
      projectId,
      type: "blocker",
      summary: "Frontend auth blocked on backend token endpoint — cross-team dependency",
      sourceMessageIds: ["msg-7"],
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: "hl-3",
      projectId,
      type: "agreed",
      summary: "OAuth2 token refresh will be handled by Sarah Chen this sprint",
      sourceMessageIds: ["msg-1"],
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: "hl-4",
      projectId,
      type: "pending_question",
      summary: "Who will review Grafana config for Redis monitoring?",
      sourceMessageIds: ["msg-6"],
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];
}

function seedExtractedTasks(projectId: string): ExtractedTask[] {
  return [
    {
      id: "et-1",
      projectId,
      title: "Implement OAuth2 token refresh flow",
      sourceMessageId: "msg-1",
      sourceText: "I'll handle the OAuth2 token refresh flow this sprint.",
      suggestedAssignee: "Sarah Chen",
      assigneeId: "user-sc",
      status: "in-progress",
      priority: "critical",
      chatReference: "msg-1",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      confirmedAt: new Date(Date.now() - 3600000 * 4.8).toISOString(),
    },
    {
      id: "et-2",
      projectId,
      title: "Fix rate limiter edge case on /api/v2",
      sourceMessageId: "msg-3",
      sourceText: "Found a rate limiter edge case on /api/v2. Need to fix it.",
      suggestedAssignee: "Marcus Li",
      assigneeId: "user-ml",
      status: "in-progress",
      priority: "high",
      chatReference: "msg-3",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      confirmedAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    },
    {
      id: "et-3",
      projectId,
      title: "Set up Grafana monitoring for Redis instances",
      sourceMessageId: "msg-6",
      sourceText: "I should set up monitoring dashboards for the new Redis instances.",
      suggestedAssignee: "James Oduro",
      status: "todo",
      priority: "medium",
      chatReference: "msg-6",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "et-4",
      projectId,
      title: "Prioritize backend token endpoint",
      sourceMessageId: "msg-7",
      sourceText: "@Marcus can you prioritize the token endpoint?",
      suggestedAssignee: "Marcus Li",
      status: "todo",
      priority: "high",
      chatReference: "msg-7",
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ];
}

function seedMemberProgress(): MemberProgress[] {
  return [
    { memberId: "user-sc", memberName: "Sarah Chen", avatar: "SC", assignedTasks: 4, completedTasks: 2, inProgressTasks: 1, completionPct: 50, lastActive: new Date(Date.now() - 3600000).toISOString(), isActive: true, contributions: 28 },
    { memberId: "user-ml", memberName: "Marcus Li", avatar: "ML", assignedTasks: 5, completedTasks: 3, inProgressTasks: 2, completionPct: 60, lastActive: new Date(Date.now() - 1800000).toISOString(), isActive: true, contributions: 35 },
    { memberId: "user-pp", memberName: "Priya Patel", avatar: "PP", assignedTasks: 3, completedTasks: 1, inProgressTasks: 1, completionPct: 33, lastActive: new Date(Date.now() - 7200000).toISOString(), isActive: true, contributions: 19 },
    { memberId: "user-jo", memberName: "James Oduro", avatar: "JO", assignedTasks: 4, completedTasks: 3, inProgressTasks: 0, completionPct: 75, lastActive: new Date(Date.now() - 86400000).toISOString(), isActive: false, contributions: 22 },
  ];
}

// ─── Context ────────────────────────────────────────────────

interface ChatContextType {
  messages: ChatMessage[];
  decisions: DecisionLog[];
  highlights: DiscussionHighlight[];
  extractedTasks: ExtractedTask[];
  memberProgress: MemberProgress[];
  insights: ChatInsight[];
  sendMessage: (projectId: string, content: string, senderName: string, senderAvatar?: string) => void;
  confirmTask: (taskId: string) => void;
  dismissTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  assignTask: (taskId: string, assigneeId: string, assigneeName: string) => void;
  aiProcessing: boolean;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  decisions: [],
  highlights: [],
  extractedTasks: [],
  memberProgress: [],
  insights: [],
  sendMessage: () => {},
  confirmTask: () => {},
  dismissTask: () => {},
  updateTaskStatus: () => {},
  assignTask: () => {},
  aiProcessing: false,
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const defaultProject = "demo-1";
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages(defaultProject));
  const [decisions, setDecisions] = useState<DecisionLog[]>(seedDecisions(defaultProject));
  const [highlights] = useState<DiscussionHighlight[]>(seedHighlights(defaultProject));
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>(seedExtractedTasks(defaultProject));
  const [memberProgress] = useState<MemberProgress[]>(seedMemberProgress());
  const [insights, setInsights] = useState<ChatInsight[]>([]);
  const [aiProcessing, setAiProcessing] = useState(false);

  // ── AI Analysis Pipeline (simulated async) ──────────────

  const runAIPipeline = useCallback(
    (msg: ChatMessage) => {
      setAiProcessing(true);

      // Simulate async AI analysis worker
      setTimeout(() => {
        // 1. Task detection
        const taskText = detectTasks(msg.content);
        if (taskText) {
          const taskId = uuidv4();
          const newTask: ExtractedTask = {
            id: taskId,
            projectId: msg.projectId,
            title: taskText.charAt(0).toUpperCase() + taskText.slice(1),
            sourceMessageId: msg.id,
            sourceText: msg.content,
            suggestedAssignee: msg.senderName,
            status: "todo",
            priority: "medium",
            chatReference: msg.id,
            createdAt: new Date().toISOString(),
          };
          setExtractedTasks((prev) => {
            // Duplicate detection
            const isDupe = prev.some(
              (t) =>
                t.title.toLowerCase().includes(taskText.toLowerCase().slice(0, 20)) ||
                taskText.toLowerCase().includes(t.title.toLowerCase().slice(0, 20))
            );
            if (isDupe) {
              const dupeInsight: ChatInsight = {
                id: uuidv4(),
                projectId: msg.projectId,
                type: "duplicate",
                content: `Potential duplicate detected: "${taskText}" may overlap with an existing task.`,
                severity: "warning",
                timestamp: new Date().toISOString(),
              };
              setInsights((p) => [...p, dupeInsight]);

              // AI message about duplicate
              const dupeMsg: ChatMessage = {
                id: uuidv4(),
                projectId: msg.projectId,
                senderId: "ai",
                senderName: "CodePolice AI",
                role: "ai",
                content: `⚠️ Duplicate detected: "${taskText}" appears similar to an existing task. Consider merging or linking them.`,
                timestamp: new Date().toISOString(),
              };
              setMessages((p) => [...p, dupeMsg]);
              return prev;
            }

            // AI message about new task
            const taskMsg: ChatMessage = {
              id: uuidv4(),
              projectId: msg.projectId,
              senderId: "ai",
              senderName: "CodePolice AI",
              role: "ai",
              content: `📋 Task detected: "${newTask.title}" — Suggested assignee: ${msg.senderName}. Awaiting confirmation.`,
              timestamp: new Date().toISOString(),
            };
            setMessages((p) => [...p, taskMsg]);

            return [...prev, newTask];
          });
        }

        // 2. Decision detection
        const decisionText = detectDecision(msg.content);
        if (decisionText) {
          const dec: DecisionLog = {
            id: uuidv4(),
            projectId: msg.projectId,
            summary: decisionText.charAt(0).toUpperCase() + decisionText.slice(1),
            participants: [msg.senderName],
            sourceMessageIds: [msg.id],
            timestamp: new Date().toISOString(),
            status: "pending",
          };
          setDecisions((prev) => [...prev, dec]);

          const decMsg: ChatMessage = {
            id: uuidv4(),
            projectId: msg.projectId,
            senderId: "ai",
            senderName: "CodePolice AI",
            role: "ai",
            content: `🔔 Decision logged: "${dec.summary}" — Status: Pending confirmation.`,
            timestamp: new Date().toISOString(),
          };
          setMessages((p) => [...p, decMsg]);
        }

        // 3. Contextual AI response (if no task/decision detected, give context-aware reply)
        if (!taskText && !decisionText) {
          const aiReply: ChatMessage = {
            id: uuidv4(),
            projectId: msg.projectId,
            senderId: "ai",
            senderName: "CodePolice AI",
            role: "ai",
            content: generateAIResponse(msg.content),
            timestamp: new Date().toISOString(),
          };
          setMessages((p) => [...p, aiReply]);
        }

        setAiProcessing(false);
      }, 800 + Math.random() * 700);
    },
    []
  );

  const sendMessage = useCallback(
    (projectId: string, content: string, senderName: string, senderAvatar?: string) => {
      const msg: ChatMessage = {
        id: uuidv4(),
        projectId,
        senderId: "current-user",
        senderName,
        senderAvatar,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      runAIPipeline(msg);
    },
    [runAIPipeline]
  );

  const confirmTask = useCallback((taskId: string) => {
    setExtractedTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, confirmedAt: new Date().toISOString(), status: "todo" as const }
          : t
      )
    );
  }, []);

  const dismissTask = useCallback((taskId: string) => {
    setExtractedTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setExtractedTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  }, []);

  const assignTask = useCallback((taskId: string, assigneeId: string, assigneeName: string) => {
    setExtractedTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, assigneeId, suggestedAssignee: assigneeName } : t
      )
    );
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        decisions,
        highlights,
        extractedTasks,
        memberProgress,
        insights,
        sendMessage,
        confirmTask,
        dismissTask,
        updateTaskStatus,
        assignTask,
        aiProcessing,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
