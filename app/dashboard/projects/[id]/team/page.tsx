"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/lib/project-context";
import { Role } from "@/lib/types";
import { useState } from "react";
import {
  ArrowLeft,
  Link2,
  Copy,
  Check,
  Search,
  UserPlus,
  X,
  ChevronDown,
  MoreVertical,
  Download,
  Filter,
  Mail,
  Users,
  Shield,
} from "lucide-react";

const ROLES: Role[] = ["Admin", "Team Lead", "Developer", "Reviewer", "Viewer"];

function getRoleBadge(role: Role) {
  const styles: Record<Role, string> = {
    Admin: "bg-blue-50 text-blue-700 border-blue-200",
    "Team Lead": "bg-violet-50 text-violet-700 border-violet-200",
    Developer: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Reviewer: "bg-amber-50 text-amber-700 border-amber-200",
    Viewer: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return styles[role] || styles.Viewer;
}

export default function TeamPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject, addTeamMember, removeTeamMember, updateMemberRole } =
    useProjects();

  const project = getProject(projectId);

  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("Viewer");
  const [searchOrg, setSearchOrg] = useState("");
  const [openActions, setOpenActions] = useState<string | null>(null);

  const inviteLink = `https://app.codepolice.dev/join/${projectId.slice(0, 8)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail))
      return;
    addTeamMember(projectId, {
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "pending",
    });
    setInviteEmail("");
  };

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Project not found
        </h2>
        <Link
          href="/dashboard"
          className="text-sm text-primary hover:text-primary-hover"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const activeMembers = project.teamMembers.filter(
    (m) => m.status === "active"
  );
  const pendingMembers = project.teamMembers.filter(
    (m) => m.status === "pending"
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">
        Team & Access
      </h1>
      <p className="text-muted mb-8 max-w-xl">
        Manage your team members, assign roles, and import collaborators
        directly from GitHub to streamline your development workflow.
      </p>

      {/* Share Invite Link */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Share Invite Link
              </h3>
              <p className="text-xs text-muted">
                Anyone with this link can join as a Viewer. You can change their
                role later.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-border text-sm text-muted truncate max-w-[260px]">
              {inviteLink}
            </div>
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-white hover:bg-primary-hover"
              }`}
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Copy className="w-4 h-4" /> Copy Link
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Import from GitHub */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-muted">&lt;&gt;</span> Import from GitHub
              </h3>
              <button className="text-sm text-primary font-medium hover:text-primary-hover transition-colors">
                Sync Organizations
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search GitHub organizations or username..."
                value={searchOrg}
                onChange={(e) => setSearchOrg(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {/* Mock org */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-700">A</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Acme Corp Engineering
                    </p>
                    <p className="text-xs text-muted">@acme-eng · 24 members</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-light hover:bg-blue-100 transition-colors">
                  Import All
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">D</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      David Chen
                    </p>
                    <p className="text-xs text-muted">@davidchen_dev</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-light hover:bg-blue-100 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Active Members Table */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Active Members
                <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-muted">
                  {activeMembers.length + 1}
                </span>
              </h3>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_auto] gap-4 px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span>User</span>
              <span>Role</span>
              <span>Actions</span>
            </div>

            {/* Owner row */}
            <div className="grid grid-cols-[2fr_1fr_auto] gap-4 items-center px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">Y</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">You</p>
                  <p className="text-xs text-muted">you@codepolice.dev</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border w-fit ${getRoleBadge(
                  "Admin"
                )}`}
              >
                Admin
              </span>
              <div className="w-8" />
            </div>

            {activeMembers.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-[2fr_1fr_auto] gap-4 items-center px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted">{member.email}</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      updateMemberRole(
                        projectId,
                        member.id,
                        e.target.value as Role
                      )
                    }
                    className={`appearance-none pl-2.5 pr-7 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none ${getRoleBadge(
                      member.role
                    )}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 opacity-50 pointer-events-none" />
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenActions(
                        openActions === member.id ? null : member.id
                      )
                    }
                    className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openActions === member.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-border py-1 z-10">
                      <button
                        onClick={() => {
                          removeTeamMember(projectId, member.id);
                          setOpenActions(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-red-50 flex items-center gap-2"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {activeMembers.length === 0 && (
              <div className="text-center py-8 text-sm text-muted">
                No active members yet. Invite someone to get started.
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Invites */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Pending Invites
            </h3>
            {pendingMembers.length === 0 ? (
              <p className="text-sm text-muted">No pending invites.</p>
            ) : (
              <div className="space-y-4">
                {pendingMembers.map((member) => (
                  <div key={member.id} className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {member.email}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getRoleBadge(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                      <p className="text-[10px] text-muted mt-1">
                        Sent {member.addedAt}
                      </p>
                    </div>
                    <button
                      onClick={() => removeTeamMember(projectId, member.id)}
                      className="p-1 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Invite */}
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs font-semibold text-foreground mb-3">
                Invite new user
              </p>
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-2"
              />
              <div className="relative mb-3">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full appearance-none px-3 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
              </div>
              <button
                onClick={handleInvite}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
