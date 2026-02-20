export type Role = "Admin" | "Team Lead" | "Developer" | "Reviewer" | "Viewer";

export type EventColor = "blue" | "green" | "red" | "amber" | "purple" | "cyan" | "pink";

export type EventCategory = "sprint" | "meeting" | "deadline" | "review" | "deployment" | "other";

export interface CalendarEvent {
  id: string;
  projectId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  endTime?: string;
  category: EventCategory;
  color: EventColor;
  description?: string;
  meetingLink?: string; // Google Meet, Zoom, etc.
  assignees?: string[]; // member IDs
  riskLevel?: "high" | "medium" | "low";
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  status: "active" | "pending";
  addedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string;
  createdAt: string;
  status: "active" | "completed" | "archived";
  teamMembers: TeamMember[];
  owner: {
    name: string;
    email: string;
    avatar?: string;
  };
}
