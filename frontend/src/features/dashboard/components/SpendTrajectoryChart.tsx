"use client";

import { useState } from "react";
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

interface SpendTrajectoryChartProps {
  monthlyData?: SpendData[];
  ytdData?: SpendData[];
}

const defaultSpendData: SpendData[] = [
  { month: "Jan", spend: 340000 },
  { month: "Feb", spend: 390000 },
  { month: "Mar", spend: 480000 },
  { month: "Apr", spend: 620000, anomaly: true },
  { month: "May", spend: 530000 },
  { month: "Jun", spend: 670000 },
  { month: "Jul", spend: 760000 },
];

export default function SpendTrajectoryChart({
  monthlyData = defaultSpendData,
  ytdData = defaultSpendData,
}: SpendTrajectoryChartProps) {
  const [period, setPeriod] = useState<"monthly" | "ytd">("ytd");
  const data = period === "monthly" ? monthlyData : ytdData;

  return (
    <section
      className="border border-[#212938] bg-[#11141d]"
      aria-labelledby="spend-trajectory-title"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#212938] px-4 py-4 sm:px-5">
        <div>
          <h2
            id="spend-trajectory-title"
            className="text-xs font-bold text-[#f3f4f6] sm:text-sm"
          >
            Spend Trajectory &amp; Anomaly Detection
          </h2>
          <p className="mt-1 text-[8px] text-[#9ba1ad] sm:text-[10px]">
            Monthly SaaS spending activity
          </p>
        </div>

        <div
          className="flex shrink-0 gap-1 border border-[#273142] p-1"
          aria-label="Spend period"
        >
          {[
            { label: "1M", value: "monthly" as const },
            { label: "YTD", value: "ytd" as const },
          ].map((option) => {
            const isActive = period === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setPeriod(option.value)}
                className={`px-2 py-1 text-[8px] font-bold transition-colors ${
                  isActive
                    ? "bg-[#24251d] text-[#f2ca50]"
                    : "text-[#9ba1ad] hover:bg-[#191c26] hover:text-[#f3f4f6]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-64 w-full px-2 pb-4 pt-5 sm:h-80 sm:px-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#273142"
              strokeDasharray="3 3"
              opacity={0.55}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ba1ad", fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={45}
              tick={{ fill: "#9ba1ad", fontSize: 9 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              cursor={{ fill: "#d4af37", opacity: 0.05 }}
              content={<SpendTooltip />}
            />
            <Bar dataKey="spend" radius={[2, 2, 0, 0]} maxBarSize={34}>
              {data.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={entry.anomaly ? "#d4af37" : "#353943"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 border-t border-[#212938] px-4 py-2.5 text-[8px] text-[#9ba1ad] sm:px-5">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-[#353943]" /> Normal spend
        </span>
        <span className="flex items-center gap-1.5 text-[#f2ca50]">
          <span className="h-1.5 w-1.5 bg-[#d4af37]" /> Anomaly detected
        </span>
      </div>
    </section>
  );
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) {
    return `$${value / 1_000_000}M`;
  }

  return `$${value / 1_000}K`;
}

function SpendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload?: SpendData }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0]?.payload;

  if (!data) {
    return null;
  }

  return (
    <div className="border border-[#303441] bg-[#0a0d14] px-3 py-2 shadow-xl">
      <p className="text-[10px] text-[#9ba1ad]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#f3f4f6]">
        {formatCurrency(data.spend)}
      </p>
      {data.anomaly && (
        <p className="mt-1 text-[9px] font-medium text-[#f0646c]">
          Anomaly detected
        </p>
      )}
    </div>
  );
}
