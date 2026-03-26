"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts";
import { useFilteredCategoryBreakdown, useFilteredSummary } from "@/hooks/useFilteredData";
import { formatCurrency } from "@/lib/formatters";

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]!;
  return (
    <div className="rounded-lg bg-surface-inverse px-3 py-2 text-sm text-white shadow-lg">
      <p className="font-medium">{item.name}</p>
      <p className="font-[family-name:var(--font-mono)] text-xs mt-0.5">{formatCurrency(item.value)}</p>
    </div>
  );
}

export const SpendingPieChart = React.memo(function SpendingPieChart() {
  const data = useFilteredCategoryBreakdown();
  const summary = useFilteredSummary();

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-tertiary">
        No expense data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          isAnimationActive={data.length < 20}
          animationDuration={500}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
          ))}
          <Label
            position="center"
            content={() => (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                className="font-[family-name:var(--font-display)]"
              >
                <tspan x="50%" dy="-8" fontSize="18" fontWeight="600" fill="var(--color-text-primary)">
                  {summary ? formatCurrency(summary.totalExpenses) : "$0"}
                </tspan>
                <tspan x="50%" dy="20" fontSize="11" fill="var(--color-text-tertiary)">
                  Total Spent
                </tspan>
              </text>
            )}
          />
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
});
