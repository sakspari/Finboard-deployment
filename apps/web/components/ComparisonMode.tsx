"use client";

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, ArrowDown, Minus, GitCompare, Calendar } from "lucide-react";
import { useComparisonStore } from "@/store/comparisonStore";
import { useComparisonData } from "@/hooks/useComparisonData";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import type { PeriodDelta, ComparisonResult } from "@/lib/comparisonAnalytics";

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25 },
  },
};

// ---------------------------------------------------------------------------
// Direction Icon
// ---------------------------------------------------------------------------

function DirectionIcon({ direction }: { direction: PeriodDelta["direction"] }) {
  switch (direction) {
    case "up":
      return <ArrowUp className="h-3.5 w-3.5" />;
    case "down":
      return <ArrowDown className="h-3.5 w-3.5" />;
    case "flat":
      return <Minus className="h-3.5 w-3.5" />;
  }
}

// ---------------------------------------------------------------------------
// Delta Badge
// ---------------------------------------------------------------------------

function DeltaBadge({
  delta,
  favorable,
}: {
  delta: PeriodDelta;
  favorable: "up" | "down" | "neutral";
}) {
  const isFavorable =
    favorable === "neutral"
      ? delta.direction === "flat"
      : delta.direction === favorable;

  const bgColor = delta.direction === "flat"
    ? "rgba(110, 125, 144, 0.14)"
    : isFavorable
      ? "rgba(19, 156, 104, 0.14)"
      : "rgba(242, 95, 92, 0.14)";

  const textColor = delta.direction === "flat"
    ? "var(--color-neutral)"
    : isFavorable
      ? "var(--color-income)"
      : "var(--color-expense)";

  const sign = delta.percentChange > 0 ? "+" : "";

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold font-[family-name:var(--font-mono)]"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <DirectionIcon direction={delta.direction} />
      {sign}{formatPercent(delta.percentChange)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Delta Card
// ---------------------------------------------------------------------------

interface DeltaCardProps {
  delta: PeriodDelta;
  accentColor: string;
  bgColor: string;
  favorable: "up" | "down" | "neutral";
  period1Label: string;
  period2Label: string;
}

function DeltaCard({
  delta,
  accentColor,
  bgColor,
  favorable,
  period1Label,
  period2Label,
}: DeltaCardProps) {
  const isCountMetric = delta.label === "Transactions";

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.008 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="relative overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900"
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent 65%)` }}
      />
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full opacity-90"
        style={{ backgroundColor: accentColor }}
      />

      <div className="p-5 md:p-6 pl-5 ml-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500 font-[family-name:var(--font-body)]">
            {delta.label}
          </span>
          <DeltaBadge delta={delta} favorable={favorable} />
        </div>

        {/* Period values side by side */}
        <div className="mt-3 flex items-end gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 truncate">
              {period1Label}
            </p>
            <p
              className="text-xl font-semibold font-[family-name:var(--font-display)] tracking-[-0.03em] tabular-nums"
              style={{ color: accentColor }}
            >
              {isCountMetric
                ? delta.period1Value.toLocaleString()
                : formatCurrency(delta.period1Value)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 truncate">
              {period2Label}
            </p>
            <p
              className="text-xl font-semibold font-[family-name:var(--font-display)] tracking-[-0.03em] tabular-nums"
              style={{ color: accentColor }}
            >
              {isCountMetric
                ? delta.period2Value.toLocaleString()
                : formatCurrency(delta.period2Value)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Period Selector
// ---------------------------------------------------------------------------

const PeriodSelector = React.memo(function PeriodSelector() {
  const mode = useComparisonStore((s) => s.mode);
  const customPeriod1 = useComparisonStore((s) => s.customPeriod1);
  const customPeriod2 = useComparisonStore((s) => s.customPeriod2);
  const setMode = useComparisonStore((s) => s.setMode);
  const setCustomPeriods = useComparisonStore((s) => s.setCustomPeriods);

  const handleModeToggle = useCallback(
    (newMode: "auto" | "custom") => {
      setMode(newMode);
    },
    [setMode],
  );

  const handlePeriodChange = useCallback(
    (period: 1 | 2, field: "start" | "end", value: string) => {
      const p1 = customPeriod1 ?? { start: "", end: "" };
      const p2 = customPeriod2 ?? { start: "", end: "" };

      if (period === 1) {
        setCustomPeriods({ ...p1, [field]: value }, p2);
      } else {
        setCustomPeriods(p1, { ...p2, [field]: value });
      }
    },
    [customPeriod1, customPeriod2, setCustomPeriods],
  );

  return (
    <motion.div variants={itemVariants} className="rounded-[28px] border border-slate-700 bg-slate-900 p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-[family-name:var(--font-body)]">
          Period Selection
        </span>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleModeToggle("auto")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
            mode === "auto"
              ? "bg-blue-500 text-white shadow-sm"
              : "bg-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-700"
          }`}
        >
          Auto (split in half)
        </button>
        <button
          onClick={() => handleModeToggle("custom")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
            mode === "custom"
              ? "bg-blue-500 text-white shadow-sm"
              : "bg-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-700"
          }`}
        >
          Custom dates
        </button>
      </div>

      {/* Custom date inputs */}
      <AnimatePresence>
        {mode === "custom" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Period 1 */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800 p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-3">
                  Period 1
                </p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customPeriod1?.start ?? ""}
                    onChange={(e) => handlePeriodChange(1, "start", e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-[family-name:var(--font-mono)] text-slate-100 outline-none focus:ring-2 focus:ring-[var(--color-focus)]/40"
                  />
                  <input
                    type="date"
                    value={customPeriod1?.end ?? ""}
                    onChange={(e) => handlePeriodChange(1, "end", e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-[family-name:var(--font-mono)] text-slate-100 outline-none focus:ring-2 focus:ring-[var(--color-focus)]/40"
                  />
                </div>
              </div>

              {/* Period 2 */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800 p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-3">
                  Period 2
                </p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customPeriod2?.start ?? ""}
                    onChange={(e) => handlePeriodChange(2, "start", e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-[family-name:var(--font-mono)] text-slate-100 outline-none focus:ring-2 focus:ring-[var(--color-focus)]/40"
                  />
                  <input
                    type="date"
                    value={customPeriod2?.end ?? ""}
                    onChange={(e) => handlePeriodChange(2, "end", e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-[family-name:var(--font-mono)] text-slate-100 outline-none focus:ring-2 focus:ring-[var(--color-focus)]/40"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ---------------------------------------------------------------------------
// Category Changes Table
// ---------------------------------------------------------------------------

const CategoryChangesTable = React.memo(function CategoryChangesTable({
  comparison,
}: {
  comparison: ComparisonResult;
}) {
  if (comparison.topCategoryChanges.length === 0) return null;

  return (
    <motion.div variants={itemVariants} className="overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900">
      <div className="p-5 md:p-6 pb-0">
        <div className="flex items-center gap-2 mb-4">
          <GitCompare className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-[family-name:var(--font-body)]">
            Category Changes
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800">
              <th className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-slate-300">
                Category
              </th>
              <th className="px-5 py-3 text-right text-[10px] font-medium uppercase tracking-wider text-slate-300">
                {comparison.period1Label}
              </th>
              <th className="px-5 py-3 text-right text-[10px] font-medium uppercase tracking-wider text-slate-300">
                {comparison.period2Label}
              </th>
              <th className="px-5 py-3 text-right text-[10px] font-medium uppercase tracking-wider text-slate-300">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.topCategoryChanges.map((cat) => {
              // Green for decreased spending, red for increased
              const isDecrease = cat.percentChange < 0;
              const isFlat = cat.percentChange === 0;
              const changeColor = isFlat
                ? "var(--color-neutral)"
                : isDecrease
                  ? "var(--color-income)"
                  : "var(--color-expense)";
              const sign = cat.percentChange > 0 ? "+" : "";

              return (
                <tr
                  key={cat.category}
                  className="border-b border-slate-700/50 last:border-0 bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  <td className="px-5 py-3 text-slate-100 font-medium text-sm">
                    {cat.category}
                  </td>
                  <td className="px-5 py-3 text-right font-[family-name:var(--font-mono)] text-slate-400 text-sm tabular-nums">
                    {formatCurrency(cat.period1Amount)}
                  </td>
                  <td className="px-5 py-3 text-right font-[family-name:var(--font-mono)] text-slate-400 text-sm tabular-nums">
                    {formatCurrency(cat.period2Amount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold font-[family-name:var(--font-mono)]"
                      style={{
                        color: changeColor,
                        backgroundColor: isFlat
                          ? "rgba(110, 125, 144, 0.1)"
                          : isDecrease
                            ? "rgba(19, 156, 104, 0.1)"
                            : "rgba(242, 95, 92, 0.1)",
                      }}
                    >
                      {!isFlat && (
                        isDecrease
                          ? <ArrowDown className="h-3 w-3" />
                          : <ArrowUp className="h-3 w-3" />
                      )}
                      {isFlat && <Minus className="h-3 w-3" />}
                      {sign}{formatPercent(cat.percentChange)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
});

// ---------------------------------------------------------------------------
// ComparisonMode (main export)
// ---------------------------------------------------------------------------

export const ComparisonMode = React.memo(function ComparisonMode() {
  const { isComparing, comparison, period1Label, period2Label } = useComparisonData();

  if (!isComparing || !comparison) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      {/* Period Selector */}
      <PeriodSelector />

      {/* Delta Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DeltaCard
          delta={comparison.income}
          accentColor="var(--color-income)"
          bgColor="var(--color-income-bg)"
          favorable="up"
          period1Label={period1Label}
          period2Label={period2Label}
        />
        <DeltaCard
          delta={comparison.expenses}
          accentColor="var(--color-expense)"
          bgColor="var(--color-expense-bg)"
          favorable="down"
          period1Label={period1Label}
          period2Label={period2Label}
        />
        <DeltaCard
          delta={comparison.netBalance}
          accentColor="var(--color-balance)"
          bgColor="var(--color-balance-bg)"
          favorable="up"
          period1Label={period1Label}
          period2Label={period2Label}
        />
        <DeltaCard
          delta={comparison.transactionCount}
          accentColor="var(--color-neutral)"
          bgColor="var(--color-neutral-bg)"
          favorable="neutral"
          period1Label={period1Label}
          period2Label={period2Label}
        />
      </div>

      {/* Category Changes Table */}
      <CategoryChangesTable comparison={comparison} />
    </motion.div>
  );
});
