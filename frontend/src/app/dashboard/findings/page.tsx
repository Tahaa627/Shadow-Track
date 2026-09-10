"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/features/dashboard/components/DashboardShell";
import { getFindings, type Finding } from "@/features/findings/api/findingsApi";

const severityConfig = {
  high: { label: "High", className: "border-red-500/30 bg-red-500/10 text-red-300" },
  medium: { label: "Medium", className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300" },
  low: { label: "Low", className: "border-blue-500/30 bg-blue-500/10 text-blue-300" },
} as const;

const typeLabels = {
  unused: "Unused Application",
  low_usage: "Low Usage",
  shadow_saas: "Shadow SaaS",
  redundant: "Redundant Application",
} as const;

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  async function loadFindings() {
    try {
      setLoading(true);
      setError("");
      setFindings(await getFindings());
    } catch (loadError) {
      console.error(loadError);
      setError("Unable to load findings. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFindings();
  }, []);

  const filteredFindings = useMemo(
    () => findings.filter((finding) =>
      (severityFilter === "all" || finding.severity === severityFilter) &&
      (typeFilter === "all" || finding.finding_type === typeFilter),
    ),
    [findings, severityFilter, typeFilter],
  );

  const totalSavings = findings.reduce(
    (sum, finding) => sum + Number(finding.potential_savings || 0),
    0,
  );
  const highSeverity = findings.filter((finding) => finding.severity === "high").length;
  const shadowSaaS = findings.filter((finding) => finding.finding_type === "shadow_saas").length;

  return (
    <ProtectedRoute>
      <DashboardShell>
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] bg-[#0a0d14] p-4 text-[#f3f4f6] sm:p-8 lg:p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#f2ca50]" aria-hidden="true" />
                <h1 className="text-xl font-semibold">Findings</h1>
              </div>
              <p className="mt-1 text-xs text-[#9ba1ad]">
                Security, SaaS usage, and cost optimization opportunities discovered by ShadowAudit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadFindings()}
              disabled={loading}
              className="flex items-center justify-center gap-2 border border-[#303849] px-3 py-2 text-xs text-[#9ba1ad] hover:border-[#f2ca50] hover:text-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} aria-hidden="true" />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-6 border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400" role="alert">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={AlertTriangle} label="Total Findings" value={findings.length} />
            <KpiCard icon={ShieldAlert} label="High Severity" value={highSeverity} />
            <KpiCard icon={CircleDollarSign} label="Potential Savings" value={`$${totalSavings.toLocaleString()}`} />
            <KpiCard icon={Users} label="Shadow SaaS" value={shadowSaaS} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              className="border border-[#303849] bg-[#11141d] px-3 py-2 text-xs text-[#f3f4f6]"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="border border-[#303849] bg-[#11141d] px-3 py-2 text-xs text-[#f3f4f6]"
            >
              <option value="all">All Types</option>
              <option value="shadow_saas">Shadow SaaS</option>
              <option value="unused">Unused</option>
              <option value="low_usage">Low Usage</option>
              <option value="redundant">Redundant</option>
            </select>
          </div>

          <section className="mt-6 border border-[#212938] bg-[#11141d]">
            <div className="border-b border-[#212938] p-5">
              <h2 className="font-semibold">Detected Opportunities</h2>
              <p className="mt-1 text-xs text-[#9ba1ad]">Review each finding and its recommended action.</p>
            </div>
            {loading ? (
              <div className="p-8 text-center text-xs text-[#9ba1ad]">Loading findings...</div>
            ) : filteredFindings.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-[#f2ca50]" aria-hidden="true" />
                <p className="mt-3 font-medium">No findings</p>
                <p className="mt-1 text-xs text-[#9ba1ad]">No opportunities match the selected filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#212938]">
                {filteredFindings.map((finding) => {
                  const severity = severityConfig[finding.severity];
                  return (
                    <article key={finding.id} className="p-5 transition hover:bg-[#141923]">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{finding.application}</h3>
                            <span className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${severity.className}`}>
                              {severity.label}
                            </span>
                            <span className="border border-[#303849] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ba1ad]">
                              {typeLabels[finding.finding_type]}
                            </span>
                          </div>
                          <p className="mt-3 max-w-3xl text-sm text-[#9ba1ad]">{finding.recommendation}</p>
                          <div className="mt-4 flex flex-wrap gap-5 text-xs text-[#737d8e]">
                            {finding.evidence.users !== undefined && <span>Users: {finding.evidence.users}</span>}
                            {finding.evidence.sessions !== undefined && <span>Sessions: {finding.evidence.sessions}</span>}
                            {finding.evidence.usage_hours !== undefined && <span>Usage: {Number(finding.evidence.usage_hours).toFixed(2)} hrs</span>}
                            <span>Annual spend: ${Number(finding.annual_spend).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="shrink-0 lg:text-right">
                          <div className="text-xs text-[#737d8e]">Potential savings</div>
                          <div className="mt-1 text-xl font-semibold text-[#f2ca50]">${Number(finding.potential_savings).toLocaleString()}</div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </DashboardShell>
    </ProtectedRoute>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: number | string;
}) {
  return (
    <div className="border border-[#212938] bg-[#11141d] p-5">
      <div className="flex items-center gap-3 text-[#9ba1ad]">
        <Icon size={17} aria-hidden="true" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
    </div>
  );
}