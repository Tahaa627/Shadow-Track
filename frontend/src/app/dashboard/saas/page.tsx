"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Cloud, RefreshCw, ShieldAlert } from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/features/dashboard/components/DashboardShell";
import {
  getSaaSInventory,
  type SaaSInventoryItem,
} from "@/features/saas/api/saasApi";

function formatCurrency(value: string | number) {
  return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function statusLabel(status: SaaSInventoryItem["status"]) {
  switch (status) {
    case "low_usage":
      return "Low usage";
    case "shadow":
      return "Shadow SaaS";
    case "unverified":
      return "Unverified";
    default:
      return "Active";
  }
}

export default function SaaSPage() {
  const [items, setItems] = useState<SaaSInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      setItems(await getSaaSInventory());
    } catch (error) {
      console.error("Failed to load SaaS inventory:", error);
      setLoadError("Unable to load SaaS inventory. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadInventory();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadInventory]);

  const totalSpend = items.reduce((sum, item) => sum + Number(item.spend), 0);
  const attentionCount = items.filter(
    (item) => item.status === "shadow" || item.status === "low_usage",
  ).length;

  return (
    <ProtectedRoute>
      <DashboardShell>
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] bg-[#0a0d14] p-4 sm:p-8 lg:p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Cloud size={18} className="text-[#f2ca50]" aria-hidden="true" />
                <h1 className="text-xl font-semibold text-[#f3f4f6]">SaaS Inventory</h1>
              </div>
              <p className="mt-1 text-xs text-[#9ba1ad]">
                Discover applications, usage, spend, and shadow SaaS.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadInventory()}
              disabled={loading}
              className="flex items-center justify-center gap-2 border border-[#303849] px-3 py-2 text-xs text-[#9ba1ad] hover:border-[#f2ca50] hover:text-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} aria-hidden="true" />
              Refresh
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              ["SaaS applications", items.length],
              ["Tracked spend", formatCurrency(totalSpend)],
              ["Attention needed", attentionCount],
            ].map(([label, value]) => (
              <section key={label} className="border border-[#212938] bg-[#11141d] p-5">
                <p className="text-[10px] uppercase tracking-wider text-[#9ba1ad]">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#f3f4f6]">{value}</p>
              </section>
            ))}
          </div>

          <div className="mt-6">
            {loading ? (
              <section className="border border-[#212938] bg-[#11141d] p-10 text-center text-xs text-[#9ba1ad]">
                Loading SaaS inventory...
              </section>
            ) : loadError ? (
              <section className="border border-red-500/20 bg-red-500/5 p-8 text-center text-xs text-red-400" role="alert">
                {loadError}
              </section>
            ) : (
              <section className="overflow-hidden border border-[#212938] bg-[#11141d]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-[#212938]">
                        {["Application", "Spend", "Users", "Sessions", "Usage", "Status"].map((heading) => (
                          <th key={heading} className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-[#9ba1ad]">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.application} className="border-b border-[#212938] last:border-0">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {item.status === "shadow" ? <ShieldAlert size={14} className="text-[#f2ca50]" aria-hidden="true" /> : null}
                              {item.status === "low_usage" ? <AlertTriangle size={14} className="text-[#f2ca50]" aria-hidden="true" /> : null}
                              <span className="text-xs font-medium text-[#f3f4f6]">{item.application}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-[#f3f4f6]">{formatCurrency(item.spend)}</td>
                          <td className="px-5 py-4 text-xs text-[#9ba1ad]">{item.users}</td>
                          <td className="px-5 py-4 text-xs text-[#9ba1ad]">{item.sessions}</td>
                          <td className="px-5 py-4 text-xs text-[#9ba1ad]">{item.total_hours}h</td>
                          <td className="px-5 py-4 text-xs text-[#9ba1ad]">{statusLabel(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </main>
      </DashboardShell>
    </ProtectedRoute>
  );
}