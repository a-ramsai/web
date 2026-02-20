"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Shield, Bell, MessageSquare, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const navLinks = [
  { href: "/dashboard", label: "Projects" },
  { href: "/dashboard/team", label: "Team" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-hover transition-colors">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            CodePolice
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-muted hover:text-foreground hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-50 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          </button>
          <button className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-50 transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Avatar / Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors cursor-pointer"
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-light flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-border py-2 animate-in fade-in slide-in-from-top-1">
                {session?.user && (
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {session.user.email}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
