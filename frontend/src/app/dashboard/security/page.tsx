"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, RefreshCw, ShieldAlert } from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/features/dashboard/components/DashboardShell";
import { getAuditEvents, type AuditEvent } from "@/features/compliance/api/complianceApi";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";

export default function SecurityPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    if (user?.role !== "ADMIN") {
      return;
    }

    setLoading(true);
    setError("");

    try {
      setEvents(await getAuditEvents(actionFilter === "all" ? undefined : actionFilter));
    } catch (loadError) {
      console.error("Failed to load audit events:", loadError);
      if (loadError instanceof ApiError && loadError.status === 403) {
        setError("Administrator access is required to view audit events.");
      } else if (loadError instanceof ApiError && loadError.status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else {
        setError("Unable to load audit events. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [actionFilter, user?.role]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadEvents();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadEvents]);

  const actionOptions = useMemo(
    () => Array.from(new Set(events.map((event) => event.action))).sort(),
    [events],
  );

  const isAdmin = user?.role === "ADMIN";

  return (
    <ProtectedRoute>
      <DashboardShell>
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] bg-[#0a0d14] p-4 text-[#f3f4f6] sm:p-8 lg:p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-[#f2ca50]" aria-hidden="true" />
                <h1 className="text-xl font-semibold">Security and compliance</h1>
              </div>
              <p className="mt-1 text-xs text-[#9ba1ad]">
                Organization audit activity, retained for administrative review.
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => void loadEvents()}
                disabled={loading}
                className="flex items-center justify-center gap-2 border border-[#303849] px-3 py-2 text-xs text-[#9ba1ad] hover:border-[#f2ca50] hover:text-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} aria-hidden="true" />
                Refresh
              </button>
            )}
          </div>

          {!isAdmin ? (
            <section className="mt-8 border border-[#212938] bg-[#11141d] p-8 text-center">
              <ShieldAlert className="mx-auto h-8 w-8 text-[#f2ca50]" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">Administrator access required</h2>
              <p className="mt-2 text-xs text-[#9ba1ad]">Audit events are available to organization administrators only.</p>
            </section>
          ) : (
            <>
              {error && <div className="mt-6 border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400" role="alert">{error}</div>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Audit log</p>
                  <p className="mt-1 text-xs text-[#9ba1ad]">Showing the latest {events.length} events.</p>
                </div>
                <select
                  value={actionFilter}
                  onChange={(event) => setActionFilter(event.target.value)}
                  className="border border-[#303849] bg-[#11141d] px-3 py-2 text-xs text-[#f3f4f6]"
                  aria-label="Filter audit events by action"
                >
                  <option value="all">All actions</option>
                  {actionOptions.map((action) => <option key={action} value={action}>{action}</option>)}
                </select>
              </div>

              <section className="mt-4 border border-[#212938] bg-[#11141d]">
                {loading ? (
                  <div className="p-10 text-center text-xs text-[#9ba1ad]">Loading audit events...</div>
                ) : events.length === 0 ? (
                  <div className="p-10 text-center">
                    <ClipboardList className="mx-auto h-8 w-8 text-[#f2ca50]" aria-hidden="true" />
                    <p className="mt-3 font-medium">No audit events</p>
                    <p className="mt-1 text-xs text-[#9ba1ad]">No events match the selected action.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#212938]">
                    {events.map((event) => (
                      <article key={event.id} className="grid gap-3 p-4 transition hover:bg-[#141923] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#f3f4f6]">{event.action}</p>
                          <p className="mt-1 truncate text-xs text-[#9ba1ad]">{event.actor_email ?? "System"}</p>
                        </div>
                        <div className="min-w-0 text-xs text-[#9ba1ad]">
                          {event.target_type ? <p className="truncate">Target: {event.target_type} {event.target_id}</p> : <p>No target</p>}
                          {Object.keys(event.metadata).length > 0 && <p className="mt-1 truncate">Metadata: {JSON.stringify(event.metadata)}</p>}
                        </div>
                        <time dateTime={event.created_at} className="text-xs text-[#737d8e] sm:text-right">
                          {new Date(event.created_at).toLocaleString()}
                        </time>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </DashboardShell>
    </ProtectedRoute>
  );
}