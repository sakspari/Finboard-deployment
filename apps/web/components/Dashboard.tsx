"use client";

import { motion } from "motion/react";
import { SummaryCards } from "./SummaryCards";
import { SpendingPieChart } from "./SpendingPieChart";
import { IncomeExpenseChart } from "./IncomeExpenseChart";
import { InsightsPanel } from "./InsightsPanel";
import { TransactionTable } from "./TransactionTable";
import { FilterBar } from "./FilterBar";
import { useTransactionStore } from "@/store/transactionStore";
import { AlertCircle } from "lucide-react";

export function Dashboard() {
  const warnings = useTransactionStore((s) => s.warnings);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Warnings banner */}
      {warnings.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-[#FEF9C3] px-4 py-3 text-sm text-[#854D0E]">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">
              {warnings.length} warning{warnings.length !== 1 ? "s" : ""} during parsing
            </p>
            <ul className="mt-1 text-xs space-y-0.5">
              {warnings.slice(0, 3).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
              {warnings.length > 3 && (
                <li>...and {warnings.length - 3} more</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards />

      {/* Charts row: 1/3 pie + 2/3 bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-surface-secondary p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-text-tertiary mb-2">
            Spending by Category
          </h3>
          <SpendingPieChart />
        </div>
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface-secondary p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-text-tertiary mb-2">
            Income vs Expenses
          </h3>
          <IncomeExpenseChart />
        </div>
      </div>

      {/* Insights */}
      <InsightsPanel />

      {/* Filter bar + Transaction table */}
      <div>
        <FilterBar />
        <div className="mt-4">
          <TransactionTable />
        </div>
      </div>
    </motion.div>
  );
}
