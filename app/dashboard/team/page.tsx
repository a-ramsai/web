"use client";

import Link from "next/link";
import { useProjects } from "@/lib/project-context";
import { Users, ArrowRight, FolderOpen } from "lucide-react";

export default function TeamOverviewPage() {
  const { projects } = useProjects();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-foreground mb-2">Team</h1>
      <p className="text-muted mb-8">
        View and manage team members across all your projects.
      </p>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No projects yet
          </h3>
          <p className="text-sm text-muted mb-6">
            Create a project first, then manage its team.
          </p>
          <Link
            href="/dashboard/new-project"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            Create New Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}/team`}
              className="bg-white rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {project.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted mb-4">
                <Users className="w-4 h-4" />
                {project.teamMembers.length} member
                {project.teamMembers.length !== 1 ? "s" : ""}
              </div>
              <div className="flex -space-x-2 mb-4">
                {project.teamMembers.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="w-8 h-8 rounded-full bg-primary-light border-2 border-white flex items-center justify-center"
                    title={m.name}
                  >
                    <span className="text-[10px] font-semibold text-primary">
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                ))}
                {project.teamMembers.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <span className="text-[10px] font-medium text-muted">
                      +{project.teamMembers.length - 5}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-primary group-hover:text-primary-hover flex items-center gap-1 transition-colors">
                Manage Team
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
