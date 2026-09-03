"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
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
  return (
    <ProtectedRoute>
      <DashboardShell>
        <section className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] bg-[#0a0d14] p-4 sm:p-8 lg:p-5">
          <div className="sr-only"><DashboardHeader /></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>
          <div className="mt-8 grid gap-3 xl:grid-cols-[minmax(0,2.1fr)_minmax(290px,1fr)]">
            <SpendAnalyticsCard />
            <section className="border border-[#212938] bg-[#11141d]" aria-labelledby="redundancy-title">
              <div className="border-b border-[#212938] px-3 py-3"><h2 id="redundancy-title" className="text-sm font-bold text-[#f3f4f6]">High-Risk Redundancies</h2><p className="mt-1 text-[8px] text-[#9ba1ad]">Identified overlapping functionality</p></div>
              <div className="grid grid-cols-[1fr_44px] border-b border-[#212938] px-3 py-2 text-[8px] font-semibold text-[#9ba1ad]"><span>Application</span><span>Est. Waste</span></div>
              {redundancies.map((item) => <div key={item.rank} className="grid grid-cols-[1fr_44px] items-center gap-2 border-b border-[#212938] px-3 py-2"><div className="flex items-center gap-2"><span className="border border-[#273142] px-1 py-1 text-[7px] text-[#9ba1ad]">{item.rank}</span><div><p className="text-[10px] font-bold text-[#f3f4f6]">{item.app}</p><p className="text-[7px] leading-tight text-[#9ba1ad]">{item.detail}</p></div></div><span className="text-[9px] font-bold text-[#f0646c]">{item.waste}</span></div>)}
              <button type="button" className="w-full px-3 py-3 text-[8px] font-bold text-[#f2ca50] hover:bg-[#191c26]">View All Anomalies →</button>
            </section>
          </div>
        </section>
      </DashboardShell>
    </ProtectedRoute>
  );
}
