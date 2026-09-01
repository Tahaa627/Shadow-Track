"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  LogOut,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = useMemo(() => {
    if (!user) return "User";

    const firstName = user.first_name?.trim();
    const lastName = user.last_name?.trim();

    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;

    return user.email.split("@")[0];
  }, [user]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[var(--color-neutral)] px-4 py-8 text-[var(--color-text-primary)] md:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                ShadowAudit
              </p>
              <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-neutral)] px-3 py-2 text-left transition hover:border-[var(--color-primary)]"
                aria-expanded={menuOpen}
                aria-label="Account menu"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <UserIcon size={16} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{user?.email ?? "No account"}</p>
                </div>
                <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg">
                  <div className="border-b border-[var(--color-border)] px-2 py-3">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{user?.email ?? ""}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/5"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                <UserIcon size={14} />
                User
              </div>
              <h2 className="mt-4 text-xl font-semibold">{displayName}</h2>
              <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Mail size={14} className="text-[var(--color-text-muted)]" />
                {user?.email ?? "Not available"}
              </div>
            </article>

            <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:col-span-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                <Building2 size={14} />
                Organization
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{user?.organization?.name ?? "No organization"}</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {user?.organization?.slug ? `@${user.organization.slug}` : "No organization slug available"}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                  <ShieldCheck size={12} />
                  {user?.role ?? "USER"}
                </div>
              </div>
            </article>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
