"use client";

import React from "react";
import { motion } from "motion/react";
import { Repeat, Store, TrendingUp, Calendar } from "lucide-react";
import { useRecurringTransactions, useTopMerchants } from "@/hooks/useMerchantData";
import { formatCurrency } from "@/lib/formatters";
import type { RecurringFrequency } from "@/lib/merchantAnalytics";

// --- Constants ---

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "bg-[#34D399]/15 text-[#34D399]",
  "Groceries": "bg-[#A78BFA]/15 text-[#A78BFA]",
  "Shopping": "bg-[#FB923C]/15 text-[#FB923C]",
  "Transportation": "bg-[#60A5FA]/15 text-[#60A5FA]",
  "Housing": "bg-[#FBBF24]/15 text-[#FBBF24]",
  "Utilities": "bg-[#F472B6]/15 text-[#F472B6]",
  "Entertainment": "bg-[#2DD4BF]/15 text-[#2DD4BF]",
  "Health": "bg-[#A3E635]/15 text-[#A3E635]",
  "Subscriptions": "bg-[#22D3EE]/15 text-[#22D3EE]",
  "Income": "bg-[#4ADE80]/15 text-[#4ADE80]",
  "Transfer": "bg-[#A1A1AA]/15 text-[#A1A1AA]",
  "Other": "bg-[#D6D3D1]/15 text-[#D6D3D1]",
};

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

const FREQUENCY_MONTHLY_MULTIPLIER: Record<RecurringFrequency, number> = {
  weekly: 4.33,
  biweekly: 2.17,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
};

// --- Animation variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

const barVariants = {
  hidden: { scaleX: 0 },
  visible: (width: number) => ({
    scaleX: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number], delay: width * 0.001 },
  }),
};

// --- Component ---

export const MerchantInsights = React.memo(function MerchantInsights() {
  const recurring = useRecurringTransactions();
  const topMerchants = useTopMerchants(5);

  const maxSpend = topMerchants.length > 0 ? topMerchants[0]!.totalAmount : 0;

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Section 1: Recurring Transactions */}
      <motion.div
        className="glass-panel rounded-[28px] p-5 md:p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-2.5 mb-5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-chart-1) 15%, transparent)" }}
          >
            <Repeat
              className="h-4 w-4"
              style={{ color: "var(--color-chart-1)" }}
            />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
            Recurring Transactions
          </h3>
        </motion.div>

        {recurring.length === 0 ? (
          <motion.p
            variants={itemVariants}
            className="py-6 text-center text-sm text-text-tertiary"
          >
            No recurring transactions detected
          </motion.p>
        ) : (
          <motion.ul
            variants={containerVariants}
            className="space-y-3"
          >
            {recurring.map((item) => {
              const monthlyTotal =
                Math.round(
                  item.estimatedAmount *
                    FREQUENCY_MONTHLY_MULTIPLIER[item.frequency] *
                    100
                ) / 100;

              return (
                <motion.li
                  key={item.merchant}
                  variants={itemVariants}
                  className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 transition-colors hover:bg-slate-800/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {item.merchant}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-slate-700/50"
                          style={{
                            backgroundColor: "color-mix(in srgb, var(--color-chart-1) 15%, transparent)",
                            color: "var(--color-chart-1)",
                          }}
                        >
                          <Calendar className="h-2.5 w-2.5" />
                          {FREQUENCY_LABELS[item.frequency]}
                        </span>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium border border-slate-700/50 ${CATEGORY_COLORS[item.category] || "bg-neutral-bg text-neutral"}`}
                        >
                          {item.category}
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline gap-4 flex-wrap">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
                            Est. amount
                          </span>
                          <p className="font-[family-name:var(--font-mono)] text-sm font-medium text-text-primary">
                            {formatCurrency(item.estimatedAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
                            Monthly cost
                          </span>
                          <p className="font-[family-name:var(--font-mono)] text-sm font-medium" style={{ color: "var(--color-expense)" }}>
                            {formatCurrency(monthlyTotal)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
                            Total spent
                          </span>
                          <p className="font-[family-name:var(--font-mono)] text-sm font-medium text-text-secondary">
                            {formatCurrency(item.totalSpent)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
                            Occurrences
                          </span>
                          <p className="font-[family-name:var(--font-display)] text-sm font-medium text-text-secondary">
                            {item.occurrences}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </motion.div>

      {/* Section 2: Top Merchants */}
      <motion.div
        className="glass-panel rounded-[28px] p-5 md:p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-2.5 mb-5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-expense) 15%, transparent)" }}
          >
            <Store
              className="h-4 w-4"
              style={{ color: "var(--color-expense)" }}
            />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
            Top Merchants
          </h3>
        </motion.div>

        {topMerchants.length === 0 ? (
          <motion.p
            variants={itemVariants}
            className="py-6 text-center text-sm text-text-tertiary"
          >
            No merchant data available
          </motion.p>
        ) : (
          <motion.ul
            variants={containerVariants}
            className="space-y-3"
          >
            {topMerchants.map((merchant, index) => {
              const barWidth =
                maxSpend > 0
                  ? Math.max((merchant.totalAmount / maxSpend) * 100, 2)
                  : 0;

              return (
                <motion.li
                  key={merchant.merchant}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-[family-name:var(--font-display)] text-xs font-semibold text-text-tertiary tabular-nums w-5 text-right shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-text-primary truncate">
                        {merchant.merchant}
                      </span>
                      <span
                        className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium border border-slate-700/50 ${CATEGORY_COLORS[merchant.category] || "bg-neutral-bg text-neutral"}`}
                      >
                        {merchant.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TrendingUp className="h-3 w-3 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-text-primary">
                        {formatCurrency(merchant.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Bar visualization */}
                  <div className="ml-7 h-2 rounded-full overflow-hidden bg-slate-800/60">
                    <motion.div
                      className="h-full rounded-full origin-left"
                      style={{
                        width: `${barWidth}%`,
                        background: `linear-gradient(90deg, var(--color-chart-${(index % 5) + 1}), color-mix(in srgb, var(--color-chart-${(index % 5) + 1}) 60%, transparent))`,
                      }}
                      custom={barWidth}
                      variants={barVariants}
                    />
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </motion.div>
    </div>
  );
});
