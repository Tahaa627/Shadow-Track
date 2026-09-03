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

export interface SpendData {
  month: string;
  spend: number;
  anomaly?: boolean;
}

const data: SpendData[] = [
  { month: "Jan", spend: 340000 },
  { month: "Feb", spend: 390000 },
  { month: "Mar", spend: 480000 },
  { month: "Apr", spend: 620000, anomaly: true },
  { month: "May", spend: 530000 },
  { month: "Jun", spend: 670000 },
  { month: "Jul", spend: 760000 },
  { month: "Aug", spend: 710000 },
  { month: "Sep", spend: 820000 },
];

export default function SpendChart() {
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
          tickFormatter={(value) => `$${value / 1000}k`}
        />

        <Tooltip
          cursor={{
            fill: "var(--color-background)",
          }}
          content={<CustomTooltip />}
        />

        <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.month}
              fill={
                entry.anomaly
                  ? "var(--color-warning)"
                  : "var(--color-primary)"
              }
            />
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
  payload?: Array<{ value: number; payload: SpendData }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-lg">
      <p className="text-[10px] font-medium text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
        {formatCurrency(payload[0].value)}
      </p>

      {item.anomaly && (
        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-amber-500">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Anomaly detected
        </div>
      )}
    </div>
  );
}
