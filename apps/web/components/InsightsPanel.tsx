"use client";

import React from "react";
import { motion } from "motion/react";
import { TrendingUp, ArrowDownRight, CalendarDays } from "lucide-react";
import { useFilteredInsights } from "@/hooks/useFilteredData";
import { formatCurrency, formatPercent } from "@/lib/formatters";

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

export const InsightsPanel = React.memo(function InsightsPanel() {
  const insights = useFilteredInsights();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.08 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {insights.topCategory && (
        <motion.div variants={cardVariants} className="rounded-xl border border-border bg-surface-secondary p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-chart-1)" }} />
            <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
              Top Category
            </span>
          </div>
          <p className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary">
            {formatCurrency(insights.topCategory.amount)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {insights.topCategory.name} ({formatPercent(insights.topCategory.percentage)})
          </p>
        </motion.div>
      )}

      {insights.biggestExpense && (
        <motion.div variants={cardVariants} className="rounded-xl border border-border bg-surface-secondary p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-expense)" }} />
            <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
              Biggest Expense
            </span>
          </div>
          <p className="text-xl font-semibold font-[family-name:var(--font-display)] text-expense">
            {formatCurrency(Math.abs(insights.biggestExpense.amount))}
          </p>
          <p className="mt-1 text-sm text-text-secondary truncate">
            {insights.biggestExpense.description}
          </p>
        </motion.div>
      )}

      <motion.div variants={cardVariants} className="rounded-xl border border-border bg-surface-secondary p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-balance)" }} />
          <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Daily Average
          </span>
        </div>
        <p className="text-xl font-semibold font-[family-name:var(--font-display)] text-balance">
          {formatCurrency(insights.averageDailySpending)}
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          Average daily spending
        </p>
      </motion.div>
    </motion.div>
  );
});
