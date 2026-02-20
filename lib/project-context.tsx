"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Project, TeamMember, CalendarEvent } from "./types";
import { v4 as uuidv4 } from "uuid";

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "createdAt" | "status">) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  updateProjectTeam: (projectId: string, members: TeamMember[]) => void;
  addTeamMember: (projectId: string, member: Omit<TeamMember, "id" | "addedAt">) => void;
  removeTeamMember: (projectId: string, memberId: string) => void;
  updateMemberRole: (projectId: string, memberId: string, role: TeamMember["role"]) => void;
  // Calendar
  events: CalendarEvent[];
  getProjectEvents: (projectId: string) => CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (eventId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Demo data
const demoProjects: Project[] = [
  {
    id: "demo-1",
    name: "CodePolice Core Platform",
    description: "Main platform for AI-powered code review and collaboration tools.",
    deadline: "2026-04-15",
    createdAt: "2026-02-10",
    status: "active",
    owner: { name: "You", email: "you@codepolice.dev" },
    teamMembers: [
      { id: "m1", name: "Sarah Jenkins", email: "sarah@acme.com", role: "Team Lead", status: "active", addedAt: "2026-02-10" },
      { id: "m2", name: "Michael Ross", email: "mike.ross@acme.com", role: "Developer", status: "active", addedAt: "2026-02-11" },
    ],
  },
  {
    id: "demo-2",
    name: "Auth Microservice",
    description: "Authentication and authorization service with OAuth2 and RBAC.",
    deadline: "2026-03-30",
    createdAt: "2026-02-15",
    status: "active",
    owner: { name: "You", email: "you@codepolice.dev" },
    teamMembers: [
      { id: "m3", name: "Jane Doe", email: "jane@snitch.dev", role: "Developer", status: "active", addedAt: "2026-02-15" },
    ],
  },
];

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [events, setEvents] = useState<CalendarEvent[]>([
    // Demo events for demo-1
    { id: "ev1", projectId: "demo-1", title: "Sprint 42 Review", date: "2026-03-01", time: "10:00", endTime: "11:00", category: "sprint", color: "blue", meetingLink: "https://meet.google.com/abc-defg-hij", description: "End of sprint review with the whole team" },
    { id: "ev2", projectId: "demo-1", title: "Design Handoff", date: "2026-03-03", time: "14:00", endTime: "15:00", category: "meeting", color: "green", meetingLink: "https://meet.google.com/xyz-uvwx-yz", description: "UI/UX handoff for dashboard redesign" },
    { id: "ev3", projectId: "demo-1", title: "API Integration", date: "2026-03-09", category: "deadline", color: "green", description: "Complete REST API integration" },
    { id: "ev4", projectId: "demo-1", title: "Sprint 42 Start", date: "2026-03-12", time: "09:00", category: "sprint", color: "blue", meetingLink: "https://meet.google.com/sprint-42" },
    { id: "ev5", projectId: "demo-1", title: "PR #302: Backend Refactor", date: "2026-03-14", category: "review", color: "red", riskLevel: "high", description: "Large PR needs thorough review" },
    { id: "ev6", projectId: "demo-1", title: "Daily Standup", date: "2026-03-14", time: "09:30", endTime: "09:45", category: "meeting", color: "blue", meetingLink: "https://meet.google.com/daily-standup", description: "Daily sync" },
    { id: "ev7", projectId: "demo-1", title: "Content Sync", date: "2026-03-17", time: "11:00", endTime: "11:30", category: "meeting", color: "green", meetingLink: "https://zoom.us/j/123456789" },
    { id: "ev8", projectId: "demo-1", title: "Client Demo", date: "2026-03-20", time: "15:00", endTime: "16:00", category: "meeting", color: "amber", meetingLink: "https://meet.google.com/client-demo", description: "Demo new features to the client" },
    { id: "ev9", projectId: "demo-1", title: "Release v2.0", date: "2026-03-20", category: "deployment", color: "green", description: "Production release" },
    { id: "ev10", projectId: "demo-1", title: "Compliance Audit", date: "2026-03-25", time: "10:00", endTime: "12:00", category: "review", color: "cyan", description: "Security compliance review" },
    { id: "ev11", projectId: "demo-1", title: "Sprint 42 End", date: "2026-03-31", category: "sprint", color: "green" },
    // Demo events for demo-2
    { id: "ev12", projectId: "demo-2", title: "Auth Design Review", date: "2026-03-05", time: "13:00", endTime: "14:00", category: "review", color: "purple", meetingLink: "https://meet.google.com/auth-review" },
    { id: "ev13", projectId: "demo-2", title: "OAuth Integration Due", date: "2026-03-18", category: "deadline", color: "red", riskLevel: "medium" },
  ]);

  const addProject = (project: Omit<Project, "id" | "createdAt" | "status">) => {
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const getProject = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  const updateProjectTeam = (projectId: string, members: TeamMember[]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, teamMembers: members } : p))
    );
  };

  const addTeamMember = (projectId: string, member: Omit<TeamMember, "id" | "addedAt">) => {
    const newMember: TeamMember = {
      ...member,
      id: uuidv4(),
      addedAt: new Date().toISOString().split("T")[0],
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, teamMembers: [...p.teamMembers, newMember] } : p
      )
    );
  };

  const removeTeamMember = (projectId: string, memberId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, teamMembers: p.teamMembers.filter((m) => m.id !== memberId) }
          : p
      )
    );
  };

  const updateMemberRole = (projectId: string, memberId: string, role: TeamMember["role"]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              teamMembers: p.teamMembers.map((m) =>
                m.id === memberId ? { ...m, role } : m
              ),
            }
          : p
      )
    );
  };

  // Calendar event functions
  const getProjectEvents = (projectId: string) => {
    return events.filter((e) => e.projectId === projectId);
  };

  const addEvent = (event: Omit<CalendarEvent, "id">) => {
    setEvents((prev) => [...prev, { ...event, id: uuidv4() }]);
  };

  const updateEvent = (eventId: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e))
    );
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        deleteProject,
        getProject,
        updateProjectTeam,
        addTeamMember,
        removeTeamMember,
        updateMemberRole,
        events,
        getProjectEvents,
        addEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
