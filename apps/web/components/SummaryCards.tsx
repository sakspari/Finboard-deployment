"use client";

import React from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Wallet, Receipt } from "lucide-react";
import { useFilteredSummary } from "@/hooks/useFilteredData";
import { formatCurrency } from "@/lib/formatters";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

interface CardProps {
  label: string;
  value: string;
  accentColor: string;
  bgColor: string;
  icon: React.ReactNode;
}

function Card({ label, value, accentColor, bgColor, icon }: CardProps) {
  return (
    <motion.div
      variants={cardVariants}
      className={`relative overflow-hidden rounded-xl border border-border bg-surface-secondary`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1`} style={{ backgroundColor: accentColor }} />
      <div className="p-5 pl-4 ml-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary font-[family-name:var(--font-body)]">
            {label}
          </span>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: bgColor }}
          >
            {icon}
          </div>
        </div>
        <p
          className="mt-2 text-2xl font-semibold font-[family-name:var(--font-display)] tabular-nums"
          style={{ color: accentColor }}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export const SummaryCards = React.memo(function SummaryCards() {
  const summary = useFilteredSummary();

  if (!summary) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <Card
        label="Income"
        value={formatCurrency(summary.totalIncome)}
        accentColor="var(--color-income)"
        bgColor="var(--color-income-bg)"
        icon={<TrendingUp className="h-4 w-4" style={{ color: "var(--color-income)" }} />}
      />
      <Card
        label="Expenses"
        value={formatCurrency(summary.totalExpenses)}
        accentColor="var(--color-expense)"
        bgColor="var(--color-expense-bg)"
        icon={<TrendingDown className="h-4 w-4" style={{ color: "var(--color-expense)" }} />}
      />
      <Card
        label="Net Balance"
        value={formatCurrency(summary.netBalance)}
        accentColor="var(--color-balance)"
        bgColor="var(--color-balance-bg)"
        icon={<Wallet className="h-4 w-4" style={{ color: "var(--color-balance)" }} />}
      />
      <Card
        label="Transactions"
        value={summary.transactionCount.toLocaleString()}
        accentColor="var(--color-neutral)"
        bgColor="var(--color-neutral-bg)"
        icon={<Receipt className="h-4 w-4" style={{ color: "var(--color-neutral)" }} />}
      />
    </motion.div>
  );
});
