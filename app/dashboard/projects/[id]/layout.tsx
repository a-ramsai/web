"use client";

import ProjectSidebar, { ProjectTopBar } from "@/components/ProjectSidebar";
import { useProjects } from "@/lib/project-context";
import { useParams } from "next/navigation";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject } = useProjects();
  const project = getProject(projectId);

  return (
    <div className="min-h-screen bg-background">
      <ProjectSidebar />
      <div className="ml-[260px] min-h-screen">
        <ProjectTopBar projectName={project?.name || "Project"} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
