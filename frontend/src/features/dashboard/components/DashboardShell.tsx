"use client";

import { useState } from "react";

import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-[#e1e2ec]">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="min-h-screen lg:ml-[260px]">
        <DashboardTopbar onOpenSidebar={() => setSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}
