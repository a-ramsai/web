"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/lib/project-context";
import { Role, TeamMember } from "@/lib/types";
import {
  ArrowLeft,
  Rocket,
  Plus,
  X,
  Mail,
  ChevronDown,
} from "lucide-react";

const ROLES: Role[] = ["Admin", "Team Lead", "Developer", "Reviewer", "Viewer"];

const QUICK_DEADLINES = [
  { label: "In 2 weeks", days: 14 },
  { label: "End of Month", days: 0, endOfMonth: true },
  { label: "Next Quarter", days: 90 },
];

function getQuickDeadline(option: (typeof QUICK_DEADLINES)[number]) {
  const now = new Date();
  if (option.endOfMonth) {
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  }
  const d = new Date(now.getTime() + option.days * 86400000);
  return d.toISOString().split("T")[0];
}

export default function NewProjectPage() {
  const router = useRouter();
  const { addProject } = useProjects();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("Developer");
  const [teamMembers, setTeamMembers] = useState<
    Omit<TeamMember, "id" | "addedAt">[]
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddMember = () => {
    if (!inviteEmail.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setErrors({ ...errors, email: "Invalid email address" });
      return;
    }
    if (teamMembers.some((m) => m.email === inviteEmail)) {
      setErrors({ ...errors, email: "Already added" });
      return;
    }

    setTeamMembers([
      ...teamMembers,
      {
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
        status: "pending",
      },
    ]);
    setInviteEmail("");
    setErrors({});
  };

  const handleRemoveMember = (email: string) => {
    setTeamMembers(teamMembers.filter((m) => m.email !== email));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Project name is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addProject({
      name: name.trim(),
      description: description.trim(),
      deadline,
      owner: { name: "You", email: "you@codepolice.dev" },
      teamMembers: teamMembers.map((m, i) => ({
        ...m,
        id: `new-${i}`,
        addedAt: new Date().toISOString().split("T")[0],
      })),
    });

    router.push("/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">
        Create New Project
      </h1>
      <p className="text-muted mb-8">
        Initialize a workspace for your team and AI agents to collaborate.
      </p>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-border p-8 space-y-7">
        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Project Name
          </label>
          <input
            type="text"
            placeholder="e.g. CodePolice Core Platform"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
              errors.name ? "border-danger" : "border-border"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-danger mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Description{" "}
            <span className="text-muted/60 normal-case font-normal">
              (Optional)
            </span>
          </label>
          <textarea
            placeholder="Describe the project goals and scope..."
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 240))}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
          <p className="text-xs text-muted text-right mt-1">
            {description.length} / 240
          </p>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Target Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <div className="flex gap-2 mt-3">
            {QUICK_DEADLINES.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => setDeadline(getQuickDeadline(q))}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted hover:text-foreground hover:border-primary/40 transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            Team Members
          </label>
          <p className="text-xs text-muted mb-3">
            Invite colleagues to collaborate on this project.
          </p>

          {/* Invite row */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.email ? "border-danger" : "border-border"
                }`}
              />
            </div>
            <div className="relative">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {ROLES.filter((r) => r !== "Admin").map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={handleAddMember}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Add
            </button>
          </div>
          {errors.email && (
            <p className="text-xs text-danger -mt-3 mb-3">{errors.email}</p>
          )}

          {/* Members list */}
          <div className="space-y-2">
            {/* Owner */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">Y</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">You</p>
                  <p className="text-xs text-muted">Project Owner</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary border border-primary/20">
                Admin
              </span>
            </div>

            {teamMembers.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{member.role}</span>
                  <button
                    onClick={() => handleRemoveMember(member.email)}
                    className="p-1 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full mt-6 py-3.5 bg-primary text-white rounded-2xl text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        <Rocket className="w-4 h-4" />
        Create Project Space
      </button>
      <p className="text-xs text-muted text-center mt-3">
        AI analysis will begin immediately after the repository is linked in the
        next step.
      </p>
    </div>
  );
}
