"use client";

import React from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useFilteredCategoryBreakdown } from "@/hooks/useFilteredData";
import { formatCurrency } from "@/lib/formatters";

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="glass-panel rounded-2xl px-3 py-2 text-sm text-text-primary shadow-xl">
      <p className="font-medium">{item.name}</p>
      <p className="font-[family-name:var(--font-mono)] text-xs mt-0.5">
        {formatCurrency(item.value)}
      </p>
    </div>
  );
}

export const CategoryRadarChart = React.memo(function CategoryRadarChart() {
  const data = useFilteredCategoryBreakdown()
    .slice(0, 6)
    .map((item) => ({
      subject: item.name,
      value: item.value,
      fullMark: Math.max(item.value, 1),
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-tertiary">
        No category data
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const normalized = data.map((item) => ({
    ...item,
    fullMark: maxValue,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={normalized} outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="Category Spend"
          dataKey="value"
          stroke="var(--color-chart-1)"
          fill="var(--color-chart-1)"
          fillOpacity={0.28}
          strokeWidth={2.5}
          isAnimationActive
        />
      </RadarChart>
    </ResponsiveContainer>
  );
});
