"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useFilteredInsights } from "@/hooks/useFilteredData";
import { formatCurrency } from "@/lib/formatters";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg bg-surface-inverse px-3 py-2 text-sm text-white shadow-lg">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-[family-name:var(--font-mono)] text-xs" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export const IncomeExpenseChart = React.memo(function IncomeExpenseChart() {
  const insights = useFilteredInsights();
  const data = insights.monthlyBreakdown;

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-tertiary">
        No data available
      </div>
    );
  }

  const chartData = data.map((m) => ({
    month: m.month,
    Income: m.income,
    Expenses: m.expenses,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="Income"
          fill="var(--color-income)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={chartData.length < 24}
        />
        <Bar
          dataKey="Expenses"
          fill="var(--color-expense)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={chartData.length < 24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
});
