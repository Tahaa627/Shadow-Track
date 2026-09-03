"use client";

import { useState } from "react";
import SpendChart from "./SpendChart";

export default function SpendAnalyticsCard() {
  const [period, setPeriod] = useState<"M" | "YTD">("YTD");

  return (
    <section
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
      aria-labelledby="spend-analytics-title"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <h2
            id="spend-analytics-title"
            className="text-sm font-semibold text-[var(--color-text-primary)]"
          >
            Spend Trajectory &amp; Anomaly Detection
          </h2>
          <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
            Monitor spending patterns and identify unusual activity
          </p>
        </div>

        <div
          className="flex shrink-0 items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-1"
          aria-label="Spend period"
        >
          {(["M", "YTD"] as const).map((option) => {
            const isActive = period === option;

            return (
              <button
                key={option}
                type="button"
                aria-pressed={isActive}
                onClick={() => setPeriod(option)}
                className={`rounded px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary)] text-black"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[320px] px-5 py-5" aria-label="Spend chart area">
        <SpendChart />
      </div>

      <div className="flex items-center justify-between px-5 pb-4">
        <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            Normal spend
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
            Anomaly
          </div>
        </div>

        <span className="text-[10px] text-[var(--color-text-muted)]">
          Last 9 months
        </span>
      </div>
    </section>
  );
}
