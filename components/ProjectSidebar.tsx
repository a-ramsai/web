"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useProjects } from "@/lib/project-context";
import {
  Shield,
  LayoutDashboard,
  AlertCircle,
  BarChart3,
  Settings,
  Users,
  CalendarDays,
  ChevronDown,
  LogOut,
  Search,
  Bell,
  Plus,
  ClipboardList,
  Flag,
  MessageSquareText,
  GitBranch,
  ShieldAlert,
  PieChart,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const sidebarSections = [
  {
    title: "PLATFORM",
    items: [
      { icon: LayoutDashboard, label: "Command Center", path: "" },
      { icon: CalendarDays, label: "Calendar", path: "/calendar" },
      { icon: AlertCircle, label: "Issues", path: "/issues", badge: "14" },
      { icon: ShieldAlert, label: "Risks & Delays", path: "/risks" },
      { icon: BarChart3, label: "Insights", path: "/insights" },
      { icon: GitBranch, label: "Repo Intelligence", path: "/repo" },
      { icon: PieChart, label: "Reports", path: "/reports" },
    ],
  },
  {
    title: "COLLABORATION",
    items: [
      { icon: MessageSquareText, label: "Smart Chat", path: "/chat" },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { icon: ClipboardList, label: "Project Operations", path: "/operations" },
      { icon: Flag, label: "Milestones", path: "/milestones" },
    ],
  },
  {
    title: "CONFIGURATION",
    items: [
      { icon: Settings, label: "Settings", path: "/settings" },
      { icon: Users, label: "Team", path: "/team" },
    ],
  },
];

export default function ProjectSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.id as string;
  const { getProject } = useProjects();
  const { data: session } = useSession();
  const project = getProject(projectId);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const basePath = `/dashboard/projects/${projectId}`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (itemPath: string) => {
    const full = basePath + itemPath;
    if (itemPath === "") return pathname === basePath;
    return pathname.startsWith(full);
  };

  return (
    <aside className="w-[260px] h-screen bg-white border-r border-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 h-16 flex items-center gap-2.5 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-foreground font-bold text-sm tracking-tight">
            CodePolice
          </span>
          <p className="text-[10px] text-muted -mt-0.5">
            Unified Intelligence
          </p>
        </div>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-[10px] font-semibold text-muted uppercase tracking-widest">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                const href =
                  item.path === ""
                    ? basePath
                    : `${basePath}${item.path}`;
                return (
                  <Link
                    key={item.label}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-primary-light text-primary"
                        : "text-muted hover:text-foreground hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 text-muted"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="relative border-t border-border" ref={menuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center overflow-hidden">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-primary">
                {session?.user?.name?.[0] || "U"}
              </span>
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-[10px] text-muted truncate">
              Engineering Lead
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted" />
        </button>

        {userMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-white rounded-xl border border-border py-1 shadow-lg">
            <Link
              href="/dashboard"
              className="block px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-gray-50 transition-colors"
            >
              All Projects
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export function ProjectTopBar({ projectName }: { projectName: string }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border h-14 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-muted hover:text-foreground transition-colors"
        >
          {projectName}
        </Link>
        <span className="text-muted/40">›</span>
        <span className="font-medium text-foreground">Dashboard</span>
        <span className="ml-3 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
          Production Live
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-border text-sm text-muted">
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
          <kbd className="ml-4 px-1.5 py-0.5 rounded bg-white border border-border text-[10px] font-mono">
            ⌘K
          </kbd>
        </div>
        <button className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-50 transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />
        </button>
        <button className="flex items-center gap-2 px-3.5 py-2 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          New Issue
        </button>
      </div>
    </header>
  );
}
