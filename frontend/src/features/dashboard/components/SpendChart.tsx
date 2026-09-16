"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSpendPoint } from "@/features/dashboard/api/dashboardApi";

export default function SpendChart({ data }: { data: DashboardSpendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
        barCategoryGap="28%"
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="var(--color-border)"
        />

        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{
            fill: "var(--color-text-muted)",
            fontSize: 10,
          }}
          dy={8}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          width={55}
          tick={{
            fill: "var(--color-text-muted)",
            fontSize: 10,
          }}
          tickFormatter={(value) => `$${Number(value) / 1000}k`}
        />

        <Tooltip
          cursor={{
            fill: "var(--color-background)",
          }}
          content={<CustomTooltip />}
        />

        <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.month} fill="var(--color-primary)" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number | string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-lg">
      <p className="text-[10px] font-medium text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
        {formatCurrency(Number(payload[0].value))}
      </p>

    </div>
  );
}
