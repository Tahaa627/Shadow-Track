"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
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
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
            opacity={0.35}
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--color-text-muted)",
              fontSize: 10,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            width={50}
            tick={{
              fill: "var(--color-text-muted)",
              fontSize: 9,
            }}
            tickFormatter={formatCurrency}
          />

          <Bar
            dataKey="spend"
            fill="var(--color-primary)"
            radius={[3, 3, 0, 0]}
            maxBarSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) {
    return `$${value / 1_000_000}M`;
  }

  return `$${value / 1_000}K`;
}
