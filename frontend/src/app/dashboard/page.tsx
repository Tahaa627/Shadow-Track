"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import KpiCard from "@/features/dashboard/components/KpiCard";
import DashboardShell from "@/features/dashboard/components/DashboardShell";

const kpis = [
  { label: "Total SaaS Spend", value: "$4.2M" },
  { label: "Unassigned Apps", value: "142" },
  { label: "Optimization Potential", value: "$850K" },
  { label: "Monitored Identities", value: "3,492" },
];

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <section className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] bg-[#0a0d14] p-4 sm:p-8">
          <DashboardHeader />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>
        </section>
      </DashboardShell>
    </ProtectedRoute>
  );
}
