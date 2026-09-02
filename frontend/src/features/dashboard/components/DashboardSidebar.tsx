"use client";

import {
  BarChart3,
  FileCheck2,
  LayoutDashboard,
  Menu,
  ScanSearch,
  Settings,
  Shield,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { label: "Executive Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expense Audit", href: "/dashboard/expenses", icon: FileCheck2 },
  { label: "Optimization Insights", href: "/dashboard/optimization", icon: ScanSearch },
  { label: "Security & Compliance", href: "/dashboard/security", icon: Shield },
];

const secondaryNavigation = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Privacy", href: "/privacy", icon: Shield },
];

export default function DashboardSidebar({
  open,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email.split("@")[0]
    : "User";

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#212938] bg-[#0d1117] px-6 py-8 transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-start justify-between px-2">
          <div>
            <h1 className="font-[Newsreader,serif] text-[38px] font-bold leading-none tracking-[-0.02em] text-[#f2ca50]">
              ShadowAudit
            </h1>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#9ba1ad]">
              Sovereign Security
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="text-[#9ba1ad] hover:text-[#f2ca50] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-12 flex-1 space-y-2" aria-label="Dashboard navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.08em] transition-colors",
                  active
                    ? "border-r-2 border-[#f2ca50] bg-[#141923] pl-4 text-[#f3f4f6]"
                    : "text-[#9ba1ad] hover:bg-[#141923] hover:text-[#f3f4f6]",
                ].join(" ")}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-4 border-t border-[#212938] pt-5">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#d4af37] px-4 py-3 text-sm font-semibold text-[#241a00] transition hover:bg-[#e2c45a] hover:shadow-[0_0_12px_rgba(212,175,55,0.3)]"
          >
            <BarChart3 size={16} aria-hidden="true" />
            Generate Report
          </button>

          <div className="space-y-1 pt-2">
            {secondaryNavigation.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9ba1ad] transition hover:text-[#f3f4f6]"
              >
                <Icon size={14} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 border-t border-[#212938] pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#384357] bg-[#32353d] text-sm font-semibold text-[#f2ca50]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#f3f4f6]">{displayName}</p>
              <p className="truncate text-xs text-[#9ba1ad]">{user?.role ?? "Member"}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function SidebarMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open navigation"
      className="rounded-md border border-[#384357] p-2 text-[#9ba1ad] hover:border-[#f2ca50] hover:text-[#f2ca50] lg:hidden"
    >
      <Menu size={18} />
    </button>
  );
}
