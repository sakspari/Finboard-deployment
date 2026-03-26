"use client";

import { motion, AnimatePresence } from "motion/react";
import { SummaryCards } from "./SummaryCards";
import { SpendingPieChart } from "./SpendingPieChart";
import { IncomeExpenseChart } from "./IncomeExpenseChart";
import { InsightsPanel } from "./InsightsPanel";
import { CategoryRadarChart } from "./CategoryRadarChart";
import { TransactionTable } from "./TransactionTable";
import { FilterBar } from "./FilterBar";
import { ComparisonMode } from "./ComparisonMode";
import { MerchantInsights } from "./MerchantInsights";
import { ChartLayoutSwitcher, CHART_LAYOUTS } from "./ChartLayoutSwitcher";
import { useTransactionStore } from "@/store/transactionStore";
import { useComparisonStore } from "@/store/comparisonStore";
import { useUIStore } from "@/store/uiStore";
import { AlertCircle } from "lucide-react";

export function Dashboard() {
  const warnings = useTransactionStore((s) => s.warnings);
  const isComparing = useComparisonStore((s) => s.isComparing);
  const chartLayout = useUIStore((s) => s.chartLayout);
  const setChartLayout = useUIStore((s) => s.setChartLayout);

  const activeConfig = CHART_LAYOUTS.find((l) => l.id === chartLayout) ?? CHART_LAYOUTS[0]!;
  const showPie = activeConfig.charts.includes("pie");
  const showArea = activeConfig.charts.includes("area");
  const showRadar = activeConfig.charts.includes("radar");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 md:space-y-10"
    >
      {/* Warnings banner */}
      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32 }}
            className="glass-panel flex items-start gap-2 rounded-2xl px-4 py-3 text-sm text-[#FBBF24]"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Mode (shown when active, replaces summary cards) */}
      <AnimatePresence mode="wait">
        {isComparing ? (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ComparisonMode />
          </motion.div>
        ) : (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <SummaryCards />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Layout Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-center"
      >
        <ChartLayoutSwitcher activeLayout={chartLayout} onLayoutChange={setChartLayout} />
      </motion.div>

      {/* Charts — dynamic layout based on selected preset */}
      <AnimatePresence mode="wait">
        <motion.div
          key={chartLayout}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4 md:space-y-5"
        >
          {/* Row 1: Pie + Area (or just one of them) */}
          {(showPie || showArea) && (
            <div className={`grid gap-4 md:gap-5 ${showPie && showArea ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
              {showPie && (
                <div className={`glass-panel glass-grid rounded-[28px] p-4 md:p-5 ${showArea ? "" : "lg:col-span-1"}`}>
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-text-tertiary mb-3">
                    Spending by Category
                  </h3>
                  <SpendingPieChart />
                </div>
              )}
              {showArea && (
                <div className={`glass-panel glass-grid rounded-[28px] p-4 md:p-5 ${showPie ? "lg:col-span-2" : ""}`}>
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-text-tertiary mb-3">
                    Income vs Expenses
                  </h3>
                  <IncomeExpenseChart />
                </div>
              )}
            </div>
          )}

          {/* Row 2: Radar + Insights (if radar enabled) */}
          {showRadar && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
              <div className="xl:col-span-2 glass-panel glass-grid rounded-[28px] p-4 md:p-5">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-text-tertiary mb-3">
                  Category Shape
                </h3>
                <CategoryRadarChart />
              </div>
              <InsightsPanel />
            </div>
          )}

          {/* If radar is not shown but insights should still appear */}
          {!showRadar && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
              <div className="xl:col-span-3">
                <InsightsPanel />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Merchant Insights */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <MerchantInsights />
      </motion.div>

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
