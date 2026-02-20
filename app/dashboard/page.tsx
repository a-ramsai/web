"use client";

import Link from "next/link";
import { useProjects } from "@/lib/project-context";
import {
  Plus,
  FolderOpen,
  Calendar,
  Users,
  MoreHorizontal,
  Trash2,
  ArrowRight,
  Search,
} from "lucide-react";
import { useState } from "react";

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "completed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "archived":
      return "bg-gray-100 text-gray-500 border-gray-200";
    default:
      return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const { projects, deleteProject } = useProjects();
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted mt-1">
            Manage your projects and collaborate with your team.
          </p>
        </div>
        <Link
          href="/dashboard/new-project"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No projects yet
          </h3>
          <p className="text-muted text-sm mb-6">
            Create your first project to get started.
          </p>
          <Link
            href="/dashboard/new-project"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="bg-white rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/20 transition-all group relative block"
            >
              {/* Menu */}
              <div className="absolute top-4 right-4" onClick={(e) => e.preventDefault()}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMenu(openMenu === project.id ? null : project.id);
                  }}
                  className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {openMenu === project.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-border py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteProject(project.id);
                        setOpenMenu(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Status */}
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border mb-4 capitalize ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>

              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground mb-2 pr-8 leading-tight">
                {project.name}
              </h3>
              <p className="text-sm text-muted mb-5 line-clamp-2 leading-relaxed">
                {project.description || "No description provided."}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-muted mb-5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {project.deadline ? formatDate(project.deadline) : "No deadline"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {project.teamMembers.length} member
                  {project.teamMembers.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Team avatars + link */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.teamMembers.slice(0, 4).map((member) => (
                    <div
                      key={member.id}
                      className="w-7 h-7 rounded-full bg-primary-light border-2 border-white flex items-center justify-center"
                      title={member.name}
                    >
                      <span className="text-[10px] font-semibold text-primary">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  ))}
                  {project.teamMembers.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                      <span className="text-[10px] font-medium text-muted">
                        +{project.teamMembers.length - 4}
                      </span>
                    </div>
                  )}
                </div>
                <span
                  className="text-xs font-medium text-primary group-hover:text-primary-hover flex items-center gap-1 transition-colors"
                >
                  Open Dashboard
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}