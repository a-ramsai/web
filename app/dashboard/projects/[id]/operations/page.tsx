"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/lib/project-context";
import {
  Plus,
  GripVertical,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ArrowRight,
  CalendarDays,
  MoreHorizontal,
  Filter,
  Search,
  Users,
  Flame,
} from "lucide-react";
import { useState } from "react";

type TaskStatus = "todo" | "in-progress" | "done";
type Priority = "low" | "medium" | "high" | "critical";

interface Task {
  id: string;
  title: string;
  assignee: string;
  avatar: string;
  priority: Priority;
  deadline: string;
  tags: string[];
  status: TaskStatus;
  storyPoints: number;
}

const initialTasks: Task[] = [
  {
    id: "OP-101",
    title: "Implement OAuth2 token refresh flow",
    assignee: "Sarah Chen",
    avatar: "SC",
    priority: "critical",
    deadline: "2026-02-22",
    tags: ["auth", "backend"],
    status: "in-progress",
    storyPoints: 5,
  },
  {
    id: "OP-102",
    title: "Fix rate limiter edge case on /api/v2",
    assignee: "Marcus Li",
    avatar: "ML",
    priority: "high",
    deadline: "2026-02-23",
    tags: ["api", "bugfix"],
    status: "in-progress",
    storyPoints: 3,
  },
  {
    id: "OP-103",
    title: "Add unit tests for payment module",
    assignee: "Priya Patel",
    avatar: "PP",
    priority: "medium",
    deadline: "2026-02-25",
    tags: ["testing", "payments"],
    status: "todo",
    storyPoints: 8,
  },
  {
    id: "OP-104",
    title: "Migrate user table to new schema",
    assignee: "James Oduro",
    avatar: "JO",
    priority: "high",
    deadline: "2026-02-24",
    tags: ["database", "migration"],
    status: "todo",
    storyPoints: 5,
  },
  {
    id: "OP-105",
    title: "Design system color token update",
    assignee: "Sarah Chen",
    avatar: "SC",
    priority: "low",
    deadline: "2026-02-28",
    tags: ["design", "frontend"],
    status: "todo",
    storyPoints: 2,
  },
  {
    id: "OP-106",
    title: "Dockerize staging environment",
    assignee: "Marcus Li",
    avatar: "ML",
    priority: "medium",
    deadline: "2026-02-26",
    tags: ["devops"],
    status: "done",
    storyPoints: 5,
  },
  {
    id: "OP-107",
    title: "Write API documentation for v2 endpoints",
    assignee: "Priya Patel",
    avatar: "PP",
    priority: "low",
    deadline: "2026-02-27",
    tags: ["docs", "api"],
    status: "done",
    storyPoints: 3,
  },
  {
    id: "OP-108",
    title: "Set up CI pipeline for e2e tests",
    assignee: "James Oduro",
    avatar: "JO",
    priority: "high",
    deadline: "2026-02-21",
    tags: ["ci/cd", "testing"],
    status: "done",
    storyPoints: 5,
  },
];

const columns: { key: TaskStatus; label: string; color: string; icon: React.ElementType }[] = [
  { key: "todo", label: "To Do", color: "text-gray-500", icon: Circle },
  { key: "in-progress", label: "In Progress", color: "text-blue-600", icon: Clock },
  { key: "done", label: "Done", color: "text-emerald-600", icon: CheckCircle2 },
];

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  high: { label: "High", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  medium: { label: "Medium", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  low: { label: "Low", color: "text-green-700", bg: "bg-green-50 border-green-200" },
};

export default function ProjectOperationsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject } = useProjects();
  const project = getProject(projectId);

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState<TaskStatus>("todo");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getColumnTasks = (status: TaskStatus) => filteredTasks.filter((t) => t.status === status);

  const totalPoints = tasks.reduce((a, t) => a + t.storyPoints, 0);
  const donePoints = tasks.filter((t) => t.status === "done").reduce((a, t) => a + t.storyPoints, 0);
  const inProgressPoints = tasks.filter((t) => t.status === "in-progress").reduce((a, t) => a + t.storyPoints, 0);
  const sprintVelocity = Math.round((donePoints / totalPoints) * 100);

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask) return;
    setTasks((prev) => prev.map((t) => (t.id === draggedTask ? { ...t, status } : t)));
    setDraggedTask(null);
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const id = `OP-${109 + tasks.length}`;
    setTasks((prev) => [
      ...prev,
      {
        id,
        title: newTaskTitle.trim(),
        assignee: "Unassigned",
        avatar: "??",
        priority: "medium",
        deadline: "2026-03-01",
        tags: [],
        status: newTaskColumn,
        storyPoints: 1,
      },
    ]);
    setNewTaskTitle("");
    setShowNewTask(false);
  };

  const daysLeft = 10;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Operations</h1>
          <p className="text-sm text-muted mt-1">Sprint board &amp; task management for {project?.name || "this project"}</p>
        </div>
        <button
          onClick={() => {
            setNewTaskColumn("todo");
            setShowNewTask(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Sprint Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm text-muted mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            Sprint Velocity
          </div>
          <p className="text-2xl font-bold text-foreground">{sprintVelocity}%</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${sprintVelocity}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm text-muted mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Completed
          </div>
          <p className="text-2xl font-bold text-foreground">
            {donePoints}<span className="text-sm font-normal text-muted">/{totalPoints} pts</span>
          </p>
          <p className="text-xs text-muted mt-1">{tasks.filter((t) => t.status === "done").length} tasks done</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm text-muted mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            In Progress
          </div>
          <p className="text-2xl font-bold text-foreground">
            {inProgressPoints}<span className="text-sm font-normal text-muted">/{totalPoints} pts</span>
          </p>
          <p className="text-xs text-muted mt-1">{tasks.filter((t) => t.status === "in-progress").length} tasks active</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm text-muted mb-1">
            <CalendarDays className="w-4 h-4 text-purple-500" />
            Sprint Ends
          </div>
          <p className="text-2xl font-bold text-foreground">{daysLeft} days</p>
          <p className="text-xs text-muted mt-1">Feb 28, 2026</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl text-sm">
          <Search className="w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks or assignees..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted"
          />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-border rounded-xl text-sm">
          <Filter className="w-4 h-4 text-muted" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | "all")}
            className="bg-transparent outline-none text-foreground text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Users className="w-4 h-4" />
          {new Set(tasks.map((t) => t.assignee)).size} members
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-5">
        {columns.map((col) => {
          const colTasks = getColumnTasks(col.key);
          const StatusIcon = col.icon;
          return (
            <div
              key={col.key}
              className="bg-gray-50/70 rounded-2xl p-4 min-h-[400px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.key)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-4 h-4 ${col.color}`} />
                  <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-border text-[11px] font-medium text-muted">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNewTaskColumn(col.key);
                    setShowNewTask(true);
                  }}
                  className="p-1 rounded-lg hover:bg-white text-muted hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {colTasks.map((task) => {
                  const prio = priorityConfig[task.priority];
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggedTask(task.id)}
                      className="bg-white rounded-xl border border-border p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[11px] font-mono text-muted">{task.id}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${prio.bg} ${prio.color}`}>
                          {prio.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-3 leading-snug">{task.title}</h4>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {task.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-muted text-[10px] rounded-full font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
                            <span className="text-[9px] font-bold text-primary">{task.avatar}</span>
                          </div>
                          <span className="text-xs text-muted">{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <span className="font-medium text-primary">{task.storyPoints}pt</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">New Task</h3>
            <p className="text-xs text-muted mb-3">
              Adding to <span className="font-semibold">{columns.find((c) => c.key === newTaskColumn)?.label}</span>
            </p>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Task title..."
              className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewTask(false)}
                className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
