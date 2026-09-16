"use client";

import { useEffect, useState } from "react";

import ProtectedRoute from "@/components/ProtectedRoute";
import {
  getDashboardAnomalies,
  type DashboardAnomaly,
} from "@/features/dashboard/api/anomalyApi";
import {
  getDashboardSummary,
  type DashboardSummary,
} from "@/features/dashboard/api/dashboardApi";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import KpiCard from "@/features/dashboard/components/KpiCard";
import DashboardShell from "@/features/dashboard/components/DashboardShell";
import SpendAnalyticsCard from "@/features/dashboard/components/SpendAnalyticsCard";

const kpis = [
  { label: "Total SaaS Spend (YTD)", value: "$4.2M", detail: "+12% vs prior quarter", detailClass: "text-[#f0646c]", accent: "border-l-[#d4af37]", icon: "▤" },
  { label: "Unsanctioned Apps", value: "142", detail: "High Risk Exposure Detected", detailClass: "text-[#f2ca50]", accent: "border-l-[#f0646c]", icon: "▲" },
  { label: "Optimization Potential", value: "$850K", detail: "Identified redundant licenses", detailClass: "text-[#9ba1ad]", accent: "border-l-[#f2ca50]", icon: "♧" },
  { label: "Monitored Identities", value: "3,492", detail: "• Active Sync", detailClass: "text-[#9ba1ad]", accent: "border-l-[#273142]", icon: "♧" },
];

const redundancies = [
  { rank: "A1", app: "Miro", detail: "Overlaps: Lucidchart, FigJam", waste: "$42k" },
  { rank: "A2", app: "Airtable", detail: "Overlaps: Smartsheet, Notion", waste: "$28k" },
  { rank: "C3", app: "Calendly", detail: "Native via Google Workspace", waste: "$15k" },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [anomalyCount, setAnomalyCount] = useState<number | null>(null);
  const [anomalies, setAnomalies] = useState<DashboardAnomaly[]>([]);
  const [anomaliesLoading, setAnomaliesLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [summaryData, anomalyData] = await Promise.all([
          getDashboardSummary(),
          getDashboardAnomalies(),
        ]);

        setSummary(summaryData);
        setAnomalyCount(anomalyData.count);
        setAnomalies(anomalyData.results);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setSummaryLoading(false);
        setAnomaliesLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const liveKpiValues = [
    summaryLoading
      ? "—"
      : `$${Number(summary?.total_spend ?? 0).toLocaleString()}`,
    summaryLoading ? "—" : `${summary?.shadow_saas_count ?? 0}`,
    summaryLoading
      ? "—"
      : `$${Number(summary?.potential_savings ?? 0).toLocaleString()}`,
    summaryLoading ? "—" : `${summary?.active_tools ?? 0}`,
  ];

  return (
    <ProtectedRoute>
      <DashboardShell>
        <section className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] bg-[#0a0d14] p-4 sm:p-8 lg:p-5">
          <div className="sr-only"><DashboardHeader /></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi, index) => (
              <KpiCard key={kpi.label} {...kpi} value={liveKpiValues[index]} />
            ))}
          </div>
          <div className="mt-8 grid gap-3 xl:grid-cols-[minmax(0,2.1fr)_minmax(290px,1fr)]">
            <SpendAnalyticsCard />
            <section className="border border-[#212938] bg-[#11141d]" aria-labelledby="redundancy-title">
              <div className="border-b border-[#212938] px-3 py-3"><h2 id="redundancy-title" className="text-sm font-bold text-[#f3f4f6]">High-Risk Redundancies</h2><p className="mt-1 text-[8px] text-[#9ba1ad]">Identified overlapping functionality</p></div>
              <div className="grid grid-cols-[1fr_44px] border-b border-[#212938] px-3 py-2 text-[8px] font-semibold text-[#9ba1ad]"><span>Application</span><span>Est. Waste</span></div>
              {redundancies.map((item) => <div key={item.rank} className="grid grid-cols-[1fr_44px] items-center gap-2 border-b border-[#212938] px-3 py-2"><div className="flex items-center gap-2"><span className="border border-[#273142] px-1 py-1 text-[7px] text-[#9ba1ad]">{item.rank}</span><div><p className="text-[10px] font-bold text-[#f3f4f6]">{item.app}</p><p className="text-[7px] leading-tight text-[#9ba1ad]">{item.detail}</p></div></div><span className="text-[9px] font-bold text-[#f0646c]">{item.waste}</span></div>)}
              <div className="border-b border-[#212938] px-3 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#9ba1ad]">Live anomalies</span>
                  <span className="text-[8px] font-bold text-[#f2ca50]">{anomalyCount ?? "..."}</span>
                </div>

                {anomaliesLoading ? (
                  <div className="text-[8px] text-[#9ba1ad]">Loading anomalies...</div>
                ) : anomalies.length === 0 ? (
                  <div className="rounded-lg border border-[#212938] p-3 text-[8px] text-[#9ba1ad]">
                    No anomalies detected.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {anomalies.slice(0, 3).map((anomaly, index) => (
                      <div key={`${anomaly.type}-${anomaly.vendor}-${anomaly.date}-${index}`} className="rounded-lg border border-[#212938] bg-[#0d1118] p-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[9px] font-bold text-[#f3f4f6]">{anomaly.vendor}</p>
                            <p className="mt-1 text-[7px] leading-relaxed text-[#9ba1ad]">{anomaly.description}</p>
                          </div>
                          <span className="text-[7px] font-bold uppercase text-[#f2ca50]">{anomaly.severity}</span>
                        </div>
                        <div className="mt-2 text-[7px] text-[#9ba1ad]">
                          Amount: <span className="font-bold text-[#f3f4f6]">${Number(anomaly.amount).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" className="w-full px-3 py-3 text-[8px] font-bold text-[#f2ca50] hover:bg-[#191c26]">
                View All Anomalies ({anomalyCount ?? "..."}) →
              </button>
            </section>
          </div>
        </section>
      </DashboardShell>
    </ProtectedRoute>
  );
}
