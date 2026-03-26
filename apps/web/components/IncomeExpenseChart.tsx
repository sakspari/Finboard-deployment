"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFilteredInsights } from "@/hooks/useFilteredData";
import { formatCurrency } from "@/lib/formatters";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl px-3 py-2 text-sm text-text-primary shadow-xl">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p
          key={i}
          className="font-[family-name:var(--font-mono)] text-xs"
          style={{ color: entry.color }}
        >
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
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 6, bottom: 6 }}>
        <defs>
          <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.34} />
            <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.28} />
            <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
        <Area
          type="monotone"
          dataKey="Income"
          stroke="var(--color-income)"
          fill="url(#incomeFill)"
          strokeWidth={2.5}
          isAnimationActive={chartData.length < 24}
        />
        <Area
          type="monotone"
          dataKey="Expenses"
          stroke="var(--color-expense)"
          fill="url(#expenseFill)"
          strokeWidth={2.5}
          isAnimationActive={chartData.length < 24}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
