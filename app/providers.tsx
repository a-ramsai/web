"use client";

import { SessionProvider } from "next-auth/react";
import { ProjectProvider } from "@/lib/project-context";
import { SidebarProvider } from "@/lib/sidebar-context";
import { ChatProvider } from "@/lib/chat-context";
import { RepoProvider } from "@/lib/repo-context";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ProjectProvider>
        <SidebarProvider>
          <ChatProvider>
            <RepoProvider>{children}</RepoProvider>
          </ChatProvider>
        </SidebarProvider>
      </ProjectProvider>
    </SessionProvider>
  );
}