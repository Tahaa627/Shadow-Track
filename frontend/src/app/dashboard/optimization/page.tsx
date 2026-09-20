"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CircleDollarSign,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  Zap,
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

const typeOrder = ["unused", "low_usage", "shadow_saas", "redundant"] as const;

function formatCurrency(value: number | string) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function OptimizationPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFindings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setFindings(await getFindings());
    } catch (loadError) {
      console.error(loadError);
      setError("Unable to load optimization insights. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadFindings();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadFindings]);

  const summary = useMemo(() => {
    const totalSavings = findings.reduce(
      (sum, finding) => sum + Number(finding.potential_savings || 0),
      0,
    );
    const highPriority = findings.filter(
      (finding) => finding.severity === "high" || finding.finding_type === "shadow_saas",
    ).length;
    const quickWins = findings.filter(
      (finding) => finding.finding_type === "unused" || finding.finding_type === "low_usage",
    ).length;
    const averageSavings = findings.length ? totalSavings / findings.length : 0;

    return { totalSavings, highPriority, quickWins, averageSavings };
  }, [findings]);

  const priorityFindings = useMemo(
    () => [...findings].sort(
      (a, b) => Number(b.potential_savings || 0) - Number(a.potential_savings || 0),
    ).slice(0, 4),
    [findings],
  );

  const typeBreakdown = useMemo(
    () =>
      typeOrder.map((type) => {
        const total = findings
          .filter((finding) => finding.finding_type === type)
          .reduce((sum, finding) => sum + Number(finding.potential_savings || 0), 0);

        return {
          type,
          label: typeLabels[type],
          total,
          count: findings.filter((finding) => finding.finding_type === type).length,
        };
      }).filter((item) => item.count > 0 || item.total > 0),
    [findings],
  );

  return (
    <ProtectedRoute>
      <DashboardShell>
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] bg-[#0a0d14] p-4 text-[#f3f4f6] sm:p-8 lg:p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#f2ca50]" aria-hidden="true" />
                <h1 className="text-xl font-semibold">Optimization insights</h1>
              </div>
              <p className="mt-1 text-xs text-[#9ba1ad]">
                Prioritize spend reduction, license cleanup, and consolidation opportunities.
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

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={CircleDollarSign} label="Potential savings" value={formatCurrency(summary.totalSavings)} detail="Annualized reduction opportunity" />
            <KpiCard icon={Target} label="High-priority actions" value={String(summary.highPriority)} detail="Urgent optimization work" />
            <KpiCard icon={Zap} label="Quick wins" value={String(summary.quickWins)} detail="Unused or low-usage apps" />
            <KpiCard icon={TrendingDown} label="Avg. savings" value={formatCurrency(summary.averageSavings)} detail="Per opportunity" />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
            <section className="border border-[#212938] bg-[#11141d]">
              <div className="border-b border-[#212938] p-5">
                <h2 className="font-semibold">Top opportunities</h2>
                <p className="mt-1 text-xs text-[#9ba1ad]">The biggest savings are concentrated in a small number of apps and license actions.</p>
              </div>

              {loading ? (
                <div className="p-10 text-center text-xs text-[#9ba1ad]">Loading insights...</div>
              ) : priorityFindings.length === 0 ? (
                <div className="p-10 text-center text-xs text-[#9ba1ad]">No optimization opportunities found.</div>
              ) : (
                <div className="divide-y divide-[#212938]">
                  {priorityFindings.map((finding) => (
                    <article key={finding.id} className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[#f3f4f6]">{finding.application}</h3>
                            <span className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${severityConfig[finding.severity].className}`}>
                              {severityConfig[finding.severity].label}
                            </span>
                            <span className="border border-[#303849] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ba1ad]">
                              {typeLabels[finding.finding_type]}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-[#9ba1ad]">{finding.recommendation}</p>
                          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-[#737d8e]">
                            {finding.evidence.users !== undefined && <span>Users: {finding.evidence.users}</span>}
                            {finding.evidence.sessions !== undefined && <span>Sessions: {finding.evidence.sessions}</span>}
                            {finding.evidence.usage_hours !== undefined && (
                              <span>Usage: {Number(finding.evidence.usage_hours).toFixed(2)} hrs</span>
                            )}
                          </div>
                        </div>
                        <div className="lg:text-right">
                          <div className="text-[10px] uppercase tracking-[0.12em] text-[#9ba1ad]">Savings</div>
                          <div className="mt-1 text-xl font-semibold text-[#f2ca50]">
                            {formatCurrency(finding.potential_savings)}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <aside className="border border-[#212938] bg-[#11141d]">
              <div className="border-b border-[#212938] p-5">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#f2ca50]" aria-hidden="true" />
                  <h2 className="font-semibold">Focus areas</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {typeBreakdown.map((item) => (
                    <div key={item.type} className="rounded-lg border border-[#212938] bg-[#0d1118] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium text-[#f3f4f6]">{item.label}</p>
                        <span className="text-[10px] uppercase tracking-[0.08em] text-[#9ba1ad]">{item.count} apps</span>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-[#f2ca50]">{formatCurrency(item.total)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg border border-[#212938] bg-[#0d1118] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9ba1ad]">Recommended sequence</p>
                  <ul className="mt-3 space-y-2 text-sm text-[#9ba1ad]">
                    <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-0.5 text-[#f2ca50]" />Remove unused and duplicate licenses.</li>
                    <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-0.5 text-[#f2ca50]" />Consolidate overlapping tools with lower-value alternatives.</li>
                    <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-0.5 text-[#f2ca50]" />Review shadow SaaS and usage-based seat reductions.</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </DashboardShell>
    </ProtectedRoute>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="border border-[#212938] bg-[#11141d] p-5">
      <div className="flex items-center gap-3 text-[#9ba1ad]">
        <Icon size={17} aria-hidden="true" />
        <span className="text-[10px] uppercase tracking-[0.12em]">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-[#f3f4f6]">{value}</div>
      <p className="mt-2 text-[10px] text-[#9ba1ad]">{detail}</p>
    </article>
  );
}