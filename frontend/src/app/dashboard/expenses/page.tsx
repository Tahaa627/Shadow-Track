"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Wallet } from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/features/dashboard/components/DashboardShell";
import {
  getExpenses,
  type Expense,
} from "@/features/expenses/api/expensesApi";
import ExpenseTable from "@/features/expenses/components/ExpenseTable";
import ExpenseUpload from "@/features/expenses/components/ExpenseUpload";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const response = await getExpenses();
      setExpenses(response.results);
    } catch (error) {
      console.error("Failed to load expenses:", error);
      setLoadError("Unable to load expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadExpenses();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadExpenses]);

  return (
    <ProtectedRoute>
      <DashboardShell>
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] bg-[#0a0d14] p-4 sm:p-8 lg:p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-[#f2ca50]" aria-hidden="true" />
                <h1 className="text-xl font-semibold text-[#f3f4f6]">Expenses</h1>
              </div>
              <p className="mt-1 text-xs text-[#9ba1ad]">
                Import and analyze your organization&apos;s SaaS spend.
              </p>
            </div>
            <button
              type="button"
              onClick={loadExpenses}
              disabled={loading}
              className="flex items-center justify-center gap-2 border border-[#303849] px-3 py-2 text-xs text-[#9ba1ad] hover:border-[#f2ca50] hover:text-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} aria-hidden="true" />
              Refresh
            </button>
          </div>

          <div className="mt-6">
            <ExpenseUpload onUploaded={loadExpenses} />
          </div>

          <div className="mt-6">
            {loading ? (
              <section className="border border-[#212938] bg-[#11141d] p-8 text-center text-xs text-[#9ba1ad]">
                Loading expenses...
              </section>
            ) : loadError ? (
              <section className="border border-red-500/20 bg-red-500/5 p-8 text-center text-xs text-red-400" role="alert">
                {loadError}
              </section>
            ) : (
              <ExpenseTable expenses={expenses} />
            )}
          </div>
        </main>
      </DashboardShell>
    </ProtectedRoute>
  );
}
