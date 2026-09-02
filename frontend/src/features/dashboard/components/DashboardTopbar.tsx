"use client";

import { Bell, ChevronDown, History, LogOut, Search, User } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { SidebarMenuButton } from "./DashboardSidebar";

interface DashboardTopbarProps {
  onOpenSidebar: () => void;
}

export default function DashboardTopbar({
  onOpenSidebar,
}: DashboardTopbarProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email.split("@")[0]
    : "User";

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-[#212938] bg-[#10131a]/90 px-4 backdrop-blur-md sm:px-8 lg:px-12">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarMenuButton onClick={onOpenSidebar} />
        <div className="truncate text-lg font-semibold text-[#f3f4f6] sm:text-xl">
          Shadow IT Dashboard
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ba1ad]" />
          <input
            type="search"
            placeholder="Audit logs..."
            aria-label="Search audit logs"
            className="w-48 rounded-full border border-[#212938] bg-[#191c26] py-2 pl-9 pr-4 text-sm text-[#f3f4f6] placeholder:text-[#9ba1ad] focus:border-[#f2ca50] focus:outline-none"
          />
        </div>

        <button type="button" className="text-[#9ba1ad] transition hover:text-[#f2ca50]" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button type="button" className="hidden text-[#9ba1ad] transition hover:text-[#f2ca50] sm:block" aria-label="History">
          <History size={18} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full border border-[#212938] bg-[#11141d] px-2 py-1.5 text-[#f3f4f6] transition hover:border-[#f2ca50]"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Account menu"
          >
            <User size={16} />
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-52 rounded-xl border border-[#212938] bg-[#161b24] p-2 shadow-lg" role="menu">
              <div className="border-b border-[#212938] px-2 py-3">
                <p className="text-sm font-medium text-[#f3f4f6]">{displayName}</p>
                <p className="mt-1 truncate text-xs text-[#9ba1ad]">{user?.email ?? "No account"}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#fca5a5] transition hover:bg-[#1d1f27]"
                role="menuitem"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
