"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/lib/project-context";
import {
  Settings,
  Save,
  Shield,
  Users,
  Bell,
  Globe,
  GitBranch,
  Palette,
  Lock,
  Trash2,
  ChevronRight,
  Toggle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useState } from "react";

// ─── Types ──────────────────────────────────────────────────

type SettingsTab = "general" | "notifications" | "integrations" | "access" | "danger";

interface NotificationPref {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  slack: boolean;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
}

// ─── Seed Data ──────────────────────────────────────────────

const NOTIFICATION_PREFS: NotificationPref[] = [
  { id: "n1", label: "New Issues", description: "When a new issue is created in this project", email: true, push: true, slack: true },
  { id: "n2", label: "PR Reviews", description: "When a pull request needs your review", email: true, push: true, slack: false },
  { id: "n3", label: "Mentions", description: "When someone mentions you in a comment", email: true, push: true, slack: true },
  { id: "n4", label: "Deployment Status", description: "When a deployment succeeds or fails", email: false, push: true, slack: true },
  { id: "n5", label: "Milestone Updates", description: "When a milestone is completed or modified", email: true, push: false, slack: false },
  { id: "n6", label: "Security Alerts", description: "Dependency vulnerabilities and security issues", email: true, push: true, slack: true },
];

const INTEGRATIONS: Integration[] = [
  { id: "int1", name: "GitHub", description: "Source code, pull requests, and issue sync", icon: "GH", connected: true, lastSync: "2 minutes ago" },
  { id: "int2", name: "Slack", description: "Team notifications and bot commands", icon: "SL", connected: true, lastSync: "5 minutes ago" },
  { id: "int3", name: "Jira", description: "Issue tracking and sprint planning sync", icon: "JR", connected: false },
  { id: "int4", name: "Vercel", description: "Deployment previews and production deploys", icon: "VC", connected: true, lastSync: "1 hour ago" },
  { id: "int5", name: "Sentry", description: "Error tracking and performance monitoring", icon: "ST", connected: false },
  { id: "int6", name: "Linear", description: "Project management and issue tracking", icon: "LN", connected: false },
];

// ─── Component ──────────────────────────────────────────────

export default function SettingsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject } = useProjects();
  const project = getProject(projectId);

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saved, setSaved] = useState(false);

  // General settings state
  const [projectName, setProjectName] = useState(project?.name || "Alpha Project");
  const [projectDesc, setProjectDesc] = useState("AI-powered code review and team collaboration platform for modern engineering teams.");
  const [projectUrl, setProjectUrl] = useState("https://github.com/org/alpha-project");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [visibility, setVisibility] = useState<"private" | "internal" | "public">("private");
  const [autoAssign, setAutoAssign] = useState(true);
  const [requireApprovals, setRequireApprovals] = useState(true);
  const [minApprovals, setMinApprovals] = useState(2);

  // Notification state
  const [notifications, setNotifications] = useState(NOTIFICATION_PREFS);

  // Access state
  const [branchProtection, setBranchProtection] = useState(true);
  const [enforcePRs, setEnforcePRs] = useState(true);
  const [requireCIPass, setRequireCIPass] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotification = (id: string, channel: "email" | "push" | "slack") => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, [channel]: !n[channel] } : n)
    );
  };

  const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
    { key: "general", label: "General", icon: Settings },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "integrations", label: "Integrations", icon: Globe },
    { key: "access", label: "Access & Security", icon: Lock },
    { key: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  return (
    <div className="max-w-350 mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Project Settings
          </h1>
          <p className="text-sm text-muted mt-1">
            Configure {project?.name || "project"} preferences, integrations, and access controls
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar Tabs ── */}
        <div className="w-52 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const TIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : tab.key === "danger"
                      ? "text-red-500 hover:bg-red-50"
                      : "text-muted hover:text-foreground hover:bg-gray-50"
                }`}
              >
                <TIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 space-y-6">
          {/* ══════════ GENERAL ══════════ */}
          {activeTab === "general" && (
            <>
              <SettingsSection title="Project Information" description="Basic details about your project">
                <div className="space-y-4">
                  <Field label="Project Name">
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-lg bg-white border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm rounded-lg bg-white border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                  </Field>
                  <Field label="Repository URL">
                    <div className="relative">
                      <GitBranch className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={projectUrl}
                        onChange={(e) => setProjectUrl(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg bg-white border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Default Branch">
                      <input
                        type="text"
                        value={defaultBranch}
                        onChange={(e) => setDefaultBranch(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-lg bg-white border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </Field>
                    <Field label="Visibility">
                      <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                        className="w-full px-3 py-2.5 text-sm rounded-lg bg-white border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="private">Private — Team only</option>
                        <option value="internal">Internal — Organization</option>
                        <option value="public">Public — Everyone</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Workflow" description="Configure code review and assignment rules">
                <div className="space-y-4">
                  <ToggleRow
                    label="Auto-assign reviewers"
                    description="Automatically assign reviewers based on code ownership"
                    checked={autoAssign}
                    onChange={setAutoAssign}
                  />
                  <ToggleRow
                    label="Require approvals before merge"
                    description="Pull requests must be approved before merging"
                    checked={requireApprovals}
                    onChange={setRequireApprovals}
                  />
                  {requireApprovals && (
                    <Field label="Minimum approvals required">
                      <select
                        value={minApprovals}
                        onChange={(e) => setMinApprovals(Number(e.target.value))}
                        className="w-40 px-3 py-2.5 text-sm rounded-lg bg-white border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n} approval{n > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                </div>
              </SettingsSection>
            </>
          )}

          {/* ══════════ NOTIFICATIONS ══════════ */}
          {activeTab === "notifications" && (
            <SettingsSection title="Notification Preferences" description="Choose how and when you receive notifications">
              <div className="space-y-1">
                {/* Header */}
                <div className="flex items-center gap-4 px-4 py-2 text-[10px] font-semibold text-muted uppercase tracking-wider">
                  <span className="flex-1">Event</span>
                  <span className="w-16 text-center">Email</span>
                  <span className="w-16 text-center">Push</span>
                  <span className="w-16 text-center">Slack</span>
                </div>
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{n.label}</p>
                      <p className="text-xs text-muted">{n.description}</p>
                    </div>
                    {(["email", "push", "slack"] as const).map((ch) => (
                      <div key={ch} className="w-16 flex justify-center">
                        <button
                          onClick={() => toggleNotification(n.id, ch)}
                          className={`w-9 h-5 rounded-full relative transition-colors ${n[ch] ? "bg-primary" : "bg-gray-200"}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${n[ch] ? "left-4.5" : "left-0.5"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </SettingsSection>
          )}

          {/* ══════════ INTEGRATIONS ══════════ */}
          {activeTab === "integrations" && (
            <SettingsSection title="Connected Services" description="Manage third-party integrations">
              <div className="space-y-3">
                {INTEGRATIONS.map((int) => (
                  <div key={int.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${int.connected ? "bg-primary/10 text-primary" : "bg-gray-100 text-muted"}`}>
                      {int.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{int.name}</p>
                        {int.connected && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted">{int.description}</p>
                      {int.lastSync && <p className="text-[10px] text-muted mt-0.5">Last synced {int.lastSync}</p>}
                    </div>
                    <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      int.connected
                        ? "text-red-600 hover:bg-red-50 border border-red-200"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}>
                      {int.connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </SettingsSection>
          )}

          {/* ══════════ ACCESS & SECURITY ══════════ */}
          {activeTab === "access" && (
            <>
              <SettingsSection title="Branch Protection" description="Enforce rules on protected branches">
                <div className="space-y-4">
                  <ToggleRow
                    label="Enable branch protection"
                    description={`Restrict direct pushes to the ${defaultBranch} branch`}
                    checked={branchProtection}
                    onChange={setBranchProtection}
                  />
                  <ToggleRow
                    label="Require pull requests"
                    description="All changes must be submitted via pull request"
                    checked={enforcePRs}
                    onChange={setEnforcePRs}
                  />
                  <ToggleRow
                    label="Require CI to pass"
                    description="All status checks must pass before merging"
                    checked={requireCIPass}
                    onChange={setRequireCIPass}
                  />
                </div>
              </SettingsSection>

              <SettingsSection title="Access Roles" description="Current team members and their roles">
                <div className="space-y-2">
                  {[
                    { name: "Sarah Chen", role: "Admin", avatar: "SC" },
                    { name: "Marcus Li", role: "Maintainer", avatar: "ML" },
                    { name: "Priya Patel", role: "Developer", avatar: "PP" },
                    { name: "James Oduro", role: "Developer", avatar: "JO" },
                  ].map((member) => (
                    <div key={member.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-primary">{member.avatar}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground flex-1">{member.name}</span>
                      <select
                        defaultValue={member.role}
                        className="px-2.5 py-1.5 text-xs rounded-lg bg-white border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option>Admin</option>
                        <option>Maintainer</option>
                        <option>Developer</option>
                        <option>Viewer</option>
                      </select>
                    </div>
                  ))}
                </div>
              </SettingsSection>
            </>
          )}

          {/* ══════════ DANGER ZONE ══════════ */}
          {activeTab === "danger" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-sm text-red-800">These actions are destructive and cannot be undone. Proceed with caution.</p>
              </div>

              <DangerAction
                title="Transfer Project"
                description="Transfer this project to another organization or team. All settings and integrations will be preserved."
                buttonLabel="Transfer"
              />
              <DangerAction
                title="Archive Project"
                description="Archive this project. It will become read-only and hidden from the dashboard. Can be restored later."
                buttonLabel="Archive"
              />
              <DangerAction
                title="Delete Project"
                description="Permanently delete this project and all associated data including issues, PRs, and deployment history. This cannot be undone."
                buttonLabel="Delete Project"
                destructive
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub Components ─────────────────────────────────────────

function SettingsSection({ title, description, children }: {
  title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5.5 rounded-full relative transition-colors shrink-0 ${checked ? "bg-primary" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${checked ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function DangerAction({ title, description, buttonLabel, destructive }: {
  title: string; description: string; buttonLabel: string; destructive?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 flex items-center justify-between ${destructive ? "border-red-300 bg-red-50/50" : "border-border bg-white"}`}>
      <div>
        <h4 className={`text-sm font-semibold ${destructive ? "text-red-700" : "text-foreground"}`}>{title}</h4>
        <p className="text-xs text-muted mt-0.5 max-w-md">{description}</p>
      </div>
      <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        destructive
          ? "bg-red-600 text-white hover:bg-red-700"
          : "border border-red-200 text-red-600 hover:bg-red-50"
      }`}>
        {buttonLabel}
      </button>
    </div>
  );
}
