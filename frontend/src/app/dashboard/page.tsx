"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import DashboardShell from "@/features/dashboard/components/DashboardShell";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <section className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] bg-[#0a0d14] p-4 sm:p-8">
          <DashboardHeader />
          <div className="mt-8 flex min-h-[calc(100vh-13rem)] items-center justify-center border border-dashed border-[#212938] bg-[#0d1117] p-8 text-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f2ca50]">
                Executive Overview
              </p>
              <h1 className="mt-3 font-[Newsreader,serif] text-3xl text-[#f3f4f6] sm:text-4xl">
                Dashboard workspace
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#9ba1ad]">
                Your dashboard modules will appear here as ShadowAudit features are connected.
              </p>
            </div>
          </div>
        </section>
      </DashboardShell>
    </ProtectedRoute>
  );
}
