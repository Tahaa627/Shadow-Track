"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  Laptop,
  Monitor,
  Plus,
  Radio,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/features/dashboard/components/DashboardShell";
import { useAuth } from "@/hooks/useAuth";
import {
  createExtensionEnrollment,
  getExtensionEnrollments,
  revokeExtensionEnrollment,
  type ExtensionEnrollment,
} from "@/features/extensions/api/extensionsApi";

const statusConfig = {
  active: {
    label: "Active",
    badgeClass: "border-[#245e48] bg-[#0d2a20] text-[#6ee7b7]",
    dotClass: "bg-[#34d399]",
    icon: ShieldCheck,
  },
  pending: {
    label: "Pending",
    badgeClass: "border-[#6b5311] bg-[#2c2309] text-[#f2ca50]",
    dotClass: "bg-[#f2ca50] animate-pulse",
    icon: Clock,
  },
  revoked: {
    label: "Revoked",
    badgeClass: "border-[#6b2930] bg-[#2c1115] text-[#fca5a5]",
    dotClass: "bg-[#f87171]",
    icon: ShieldAlert,
  },
} as const;

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Never seen";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return "Active just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function formatFullDate(dateString: string | null): string {
  if (!dateString) return "Not recorded";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export default function ExtensionPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<ExtensionEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "revoked">("all");

  // Highlighted enrollment banner (when admin generates a new code)
  const [activeNewCode, setActiveNewCode] = useState<ExtensionEnrollment | null>(null);

  // Revoke confirmation modal state
  const [revokeTarget, setRevokeTarget] = useState<ExtensionEnrollment | null>(null);
  const [revoking, setRevoking] = useState(false);

  const loadEnrollments = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setError("");
      const data = await getExtensionEnrollments();
      setEnrollments(data);

      // If active new code was pending and is now active, update it
      if (activeNewCode) {
        const updated = data.find((e) => e.id === activeNewCode.id);
        if (updated) {
          if (activeNewCode.status === "pending" && updated.status === "active") {
            setSuccessMessage(`Device #${updated.id} successfully connected!`);
            window.setTimeout(() => setSuccessMessage(""), 5000);
          }
          setActiveNewCode(updated);
        }
      }
    } catch (err) {
      console.error("Failed to load extension enrollments:", err);
      if (!isSilent) setError("Unable to load browser enrollments.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [activeNewCode]);

  // Initial load
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    void loadEnrollments();
  }, [authLoading, isAuthenticated, loadEnrollments]);

  // Polling: automatically polls every 4 seconds while any enrollment is pending
  const hasPending = useMemo(
    () => enrollments.some((e) => e.status === "pending"),
    [enrollments],
  );

  useEffect(() => {
    if (!hasPending) return;

    const interval = window.setInterval(() => {
      void loadEnrollments(true);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [hasPending, loadEnrollments]);

  async function handleGenerateCode() {
    try {
      setGenerating(true);
      setError("");
      const newEnrollment = await createExtensionEnrollment();
      setActiveNewCode(newEnrollment);
      setEnrollments((prev) => [newEnrollment, ...prev]);
      setSuccessMessage("New enrollment code generated. Paste it into the Chrome extension.");
      window.setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Failed to generate code:", err);
      setError("Unable to generate enrollment code. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard(text: string, id: number | string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  async function handleConfirmRevoke() {
    if (!revokeTarget) return;

    try {
      setRevoking(true);
      setError("");
      const updated = await revokeExtensionEnrollment(revokeTarget.id);
      setEnrollments((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e)),
      );
      if (activeNewCode?.id === updated.id) {
        setActiveNewCode(updated);
      }
      setRevokeTarget(null);
      setSuccessMessage(`Enrollment #${updated.id} was revoked.`);
      window.setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to revoke enrollment:", err);
      setError("Unable to revoke extension enrollment.");
    } finally {
      setRevoking(false);
    }
  }

  // Filtered enrollments
  const filteredEnrollments = useMemo(() => {
    if (filter === "all") return enrollments;
    return enrollments.filter((e) => e.status === filter);
  }, [enrollments, filter]);

  // Metric counts
  const activeCount = useMemo(
    () => enrollments.filter((e) => e.status === "active").length,
    [enrollments],
  );
  const pendingCount = useMemo(
    () => enrollments.filter((e) => e.status === "pending").length,
    [enrollments],
  );
  const revokedCount = useMemo(
    () => enrollments.filter((e) => e.status === "revoked").length,
    [enrollments],
  );

  return (
    <ProtectedRoute>
      <DashboardShell>
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] bg-[#0a0d14] p-4 sm:p-8 lg:p-6">
          {/* Header */}
          <header className="flex flex-col justify-between gap-4 border-b border-[#212938] pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Monitor className="text-[#f2ca50]" size={22} aria-hidden="true" />
                <h1 className="text-xl font-semibold text-[#f3f4f6]">
                  Extension Management
                </h1>
                {hasPending && (
                  <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-[#6b5311] bg-[#2c2309] px-2 py-0.5 text-[10px] font-semibold text-[#f2ca50]">
                    <Radio size={10} className="animate-pulse" />
                    Polling live status
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#9ba1ad]">
                Manage employee Chrome extension enrollments, monitor device telemetry, and control access.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void loadEnrollments()}
                disabled={loading}
                className="flex items-center gap-2 border border-[#303849] bg-[#11141d] px-3 py-2 text-xs text-[#9ba1ad] transition hover:border-[#f2ca50] hover:text-[#f3f4f6] disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} aria-hidden="true" />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => void handleGenerateCode()}
                disabled={generating}
                className="flex items-center gap-2 bg-[#d4af37] px-4 py-2 text-xs font-semibold text-[#1a1400] transition hover:bg-[#e2c45a] disabled:opacity-50"
              >
                {generating ? (
                  <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Plus size={14} aria-hidden="true" />
                )}
                Generate Enrollment Code
              </button>
            </div>
          </header>

          {/* Feedback alerts */}
          {error && (
            <div
              className="mt-6 flex items-center justify-between border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-200"
                aria-label="Dismiss error"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {successMessage && (
            <div
              className="mt-6 flex items-center justify-between border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300"
              role="status"
            >
              <div className="flex items-center gap-2">
                <Check size={15} className="shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage("")}
                className="text-emerald-400 hover:text-emerald-200"
                aria-label="Dismiss message"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Metric Summary Cards */}
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Extension metrics">
            <article className="border border-[#212938] bg-[#11141d] p-4">
              <div className="flex items-center justify-between text-[#9ba1ad]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Active Devices</span>
                <span className="h-2 w-2 rounded-full bg-[#34d399]" />
              </div>
              <p className="mt-2 font-[Newsreader,serif] text-2xl font-bold text-[#f3f4f6]">
                {activeCount}
              </p>
              <p className="mt-1 text-[10px] text-[#6ee7b7]">Sending telemetry</p>
            </article>

            <article className="border border-[#212938] bg-[#11141d] p-4">
              <div className="flex items-center justify-between text-[#9ba1ad]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending Connects</span>
                <span className={`h-2 w-2 rounded-full bg-[#f2ca50] ${pendingCount > 0 ? "animate-ping" : ""}`} />
              </div>
              <p className="mt-2 font-[Newsreader,serif] text-2xl font-bold text-[#f3f4f6]">
                {pendingCount}
              </p>
              <p className="mt-1 text-[10px] text-[#f2ca50]">Awaiting enrollment</p>
            </article>

            <article className="border border-[#212938] bg-[#11141d] p-4">
              <div className="flex items-center justify-between text-[#9ba1ad]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Revoked Devices</span>
                <span className="h-2 w-2 rounded-full bg-[#f87171]" />
              </div>
              <p className="mt-2 font-[Newsreader,serif] text-2xl font-bold text-[#f3f4f6]">
                {revokedCount}
              </p>
              <p className="mt-1 text-[10px] text-[#9ba1ad]">Access terminated</p>
            </article>

            <article className="border border-[#212938] bg-[#11141d] p-4">
              <div className="flex items-center justify-between text-[#9ba1ad]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Enrolled</span>
                <Laptop size={14} className="text-[#9ba1ad]" />
              </div>
              <p className="mt-2 font-[Newsreader,serif] text-2xl font-bold text-[#f3f4f6]">
                {enrollments.length}
              </p>
              <p className="mt-1 text-[10px] text-[#9ba1ad]">All registered entries</p>
            </article>
          </section>

          {/* Active / New Enrollment Code Banner */}
          {activeNewCode && activeNewCode.status === "pending" && (
            <section
              className="mt-6 border border-[#d4af37]/40 bg-[#161922] p-5 shadow-lg sm:p-6"
              aria-labelledby="pending-code-title"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-[#f2ca50] animate-ping" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#f2ca50]">
                      Ready for browser connection
                    </span>
                  </div>
                  <h2 id="pending-code-title" className="mt-1 text-base font-semibold text-[#f3f4f6]">
                    Enrollment Code Generated
                  </h2>
                  <p className="mt-1 text-xs text-[#9ba1ad]">
                    Enter this code in the ShadowAudit Chrome extension popup to connect this browser.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveNewCode(null)}
                  className="text-[#9ba1ad] hover:text-[#f3f4f6]"
                  title="Close banner"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3 border border-[#303849] bg-[#0d1017] px-4 py-3">
                  <code className="min-w-0 flex-1 font-mono text-sm font-bold tracking-wider text-[#f2ca50] break-all">
                    {activeNewCode.enrollment_code}
                  </code>
                  <button
                    type="button"
                    onClick={() => void copyToClipboard(activeNewCode.enrollment_code, "banner")}
                    className="flex shrink-0 items-center gap-1.5 border border-[#384357] bg-[#1a1f2c] px-3 py-1.5 text-xs text-[#f3f4f6] transition hover:border-[#f2ca50] hover:text-[#f2ca50]"
                  >
                    {copiedId === "banner" ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded border border-[#6b5311]/60 bg-[#2c2309]/50 px-3 py-2.5 text-xs text-[#f2ca50]">
                  <RefreshCw size={13} className="animate-spin text-[#f2ca50]" />
                  <span>Waiting for extension...</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#212938] pt-3 text-[11px] text-[#9ba1ad]">
                <span>Expires at: {formatFullDate(activeNewCode.expires_at)} (Single use)</span>
                <span>Code valid for 15 minutes</span>
              </div>
            </section>
          )}

          {/* Device Table Section */}
          <section className="mt-8 border border-[#212938] bg-[#11141d]" aria-labelledby="devices-table-title">
            <div className="flex flex-col justify-between gap-4 border-b border-[#212938] px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 id="devices-table-title" className="text-sm font-semibold text-[#f3f4f6]">
                  Registered Browser Devices
                </h2>
                <p className="mt-0.5 text-xs text-[#9ba1ad]">
                  Track active sessions, last seen telemetry timestamps, and access status.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 border border-[#273142] bg-[#0a0d14] p-1 text-[11px]">
                {(
                  [
                    { id: "all", label: `All (${enrollments.length})` },
                    { id: "active", label: `Active (${activeCount})` },
                    { id: "pending", label: `Pending (${pendingCount})` },
                    { id: "revoked", label: `Revoked (${revokedCount})` },
                  ] as const
                ).map((tab) => {
                  const isActive = filter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilter(tab.id)}
                      className={`px-2.5 py-1 font-medium transition-colors ${
                        isActive
                          ? "bg-[#24251d] text-[#f2ca50]"
                          : "text-[#9ba1ad] hover:text-[#f3f4f6]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-[#9ba1ad]">
                <RefreshCw size={18} className="mx-auto mb-2 animate-spin text-[#d4af37]" />
                Loading enrolled devices...
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#9ba1ad]">
                <Laptop size={28} className="mx-auto mb-3 text-[#384357]" />
                <p className="font-semibold text-[#f3f4f6]">No devices found</p>
                <p className="mt-1">
                  {filter === "all"
                    ? "No browser extensions have been enrolled yet. Click 'Generate Enrollment Code' to connect one."
                    : `No devices with status '${filter}'.`}
                </p>
                {filter === "all" && (
                  <button
                    type="button"
                    onClick={() => void handleGenerateCode()}
                    disabled={generating}
                    className="mt-4 inline-flex items-center gap-2 bg-[#d4af37] px-3.5 py-2 text-xs font-semibold text-[#1a1400] hover:bg-[#e2c45a]"
                  >
                    <Plus size={13} />
                    Generate First Enrollment Code
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#212938] bg-[#0d1017] text-[10px] font-semibold uppercase tracking-wider text-[#9ba1ad]">
                    <tr>
                      <th className="px-5 py-3">Device / Status</th>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Enrollment Code</th>
                      <th className="px-5 py-3">Last Seen</th>
                      <th className="px-5 py-3">Enrolled Date</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#212938]">
                    {filteredEnrollments.map((item) => {
                      const cfg = statusConfig[item.status];

                      return (
                        <tr key={item.id} className="transition-colors hover:bg-[#151923]">
                          {/* Device / Status */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.badgeClass}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
                                {cfg.label}
                              </span>
                              <span className="font-mono text-[11px] text-[#9ba1ad]">
                                #{item.id}
                              </span>
                            </div>
                          </td>

                          {/* User */}
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-[#f3f4f6]">
                              {item.user_email || "Organization Member"}
                            </p>
                          </td>

                          {/* Enrollment Code */}
                          <td className="px-5 py-3.5">
                            {item.status === "pending" ? (
                              <div className="flex items-center gap-2">
                                <code className="font-mono text-[11px] font-semibold text-[#f2ca50]">
                                  {item.enrollment_code}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => void copyToClipboard(item.enrollment_code, item.id)}
                                  className="text-[#9ba1ad] hover:text-[#f2ca50]"
                                  title="Copy code"
                                >
                                  {copiedId === item.id ? (
                                    <Check size={12} className="text-emerald-400" />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="font-mono text-[11px] text-[#565d6d]">
                                ••••••••••••••••
                              </span>
                            )}
                          </td>

                          {/* Last Seen */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-block text-[11px] ${
                                item.status === "active" ? "text-[#6ee7b7]" : "text-[#9ba1ad]"
                              }`}
                              title={formatFullDate(item.last_seen)}
                            >
                              {formatRelativeTime(item.last_seen)}
                            </span>
                          </td>

                          {/* Enrolled Date */}
                          <td className="px-5 py-3.5 text-[#9ba1ad]">
                            {item.enrolled_at ? formatFullDate(item.enrolled_at) : "Pending"}
                          </td>

                          {/* Action */}
                          <td className="px-5 py-3.5 text-right">
                            {item.status !== "revoked" ? (
                              <button
                                type="button"
                                onClick={() => setRevokeTarget(item)}
                                className="inline-flex items-center gap-1.5 border border-red-500/20 bg-red-500/5 px-2.5 py-1 text-[11px] font-medium text-red-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200"
                              >
                                <Trash2 size={12} />
                                Revoke
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#565d6d]">Revoked</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Setup Guide Section */}
          <section className="mt-8 border border-[#212938] bg-[#11141d] p-5 sm:p-6" aria-labelledby="setup-guide-title">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#f2ca50]" />
              <h2 id="setup-guide-title" className="text-sm font-semibold text-[#f3f4f6]">
                Extension Deployment Guide
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#9ba1ad]">
              Deploy the ShadowAudit Chrome extension across team browsers to automatically discover SaaS usage.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "1",
                  title: "Load Extension",
                  detail: "Load ShadowAudit extension folder into Chrome via chrome://extensions developer mode.",
                },
                {
                  step: "2",
                  title: "Generate Code",
                  detail: "Click 'Generate Enrollment Code' above to create a unique 15-minute one-time code.",
                },
                {
                  step: "3",
                  title: "Connect Browser",
                  detail: "Open the ShadowAudit extension popup, paste the code, and click 'Connect extension'.",
                },
                {
                  step: "4",
                  title: "Verify Active State",
                  detail: "The dashboard automatically detects the connection and begins tracking domain telemetry.",
                },
              ].map((card) => (
                <div key={card.step} className="border border-[#212938] bg-[#0d1017] p-4">
                  <div className="flex h-5 w-5 items-center justify-center border border-[#384357] text-[10px] font-bold text-[#f2ca50]">
                    {card.step}
                  </div>
                  <h3 className="mt-2.5 text-xs font-semibold text-[#f3f4f6]">{card.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#9ba1ad]">{card.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Revoke Confirmation Modal */}
          {revokeTarget && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="revoke-modal-title"
            >
              <div className="w-full max-w-md border border-red-500/30 bg-[#161922] p-6 shadow-2xl">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertTriangle size={22} />
                  <h3 id="revoke-modal-title" className="text-base font-semibold text-[#f3f4f6]">
                    Revoke Extension Enrollment?
                  </h3>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[#c7c9d1]">
                  Are you sure you want to revoke Device <strong className="text-[#f3f4f6]">#{revokeTarget.id}</strong>
                  {revokeTarget.user_email ? ` (${revokeTarget.user_email})` : ""}?
                </p>

                <p className="mt-2 text-xs text-red-300">
                  This will immediately disconnect the Chrome extension and permanently prevent it from reporting telemetry to your organization.
                </p>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRevokeTarget(null)}
                    disabled={revoking}
                    className="border border-[#384357] bg-transparent px-4 py-2 text-xs font-medium text-[#9ba1ad] hover:text-[#f3f4f6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleConfirmRevoke()}
                    disabled={revoking}
                    className="flex items-center gap-2 border border-red-500 bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {revoking && <RefreshCw size={13} className="animate-spin" />}
                    Confirm Revocation
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </DashboardShell>
    </ProtectedRoute>
  );
}