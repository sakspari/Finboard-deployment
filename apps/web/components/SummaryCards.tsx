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
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
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
      whileHover={{ y: -4, scale: 1.008 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="glass-panel glass-grid relative overflow-hidden rounded-[28px]"
    >
      <div className="absolute inset-x-0 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent 65%)` }} />
      <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full opacity-90" style={{ backgroundColor: accentColor }} />
      <div className="p-5 md:p-6 pl-5 ml-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-text-tertiary font-[family-name:var(--font-body)]">
            {label}
          </span>
          <div
            className="glass-panel-soft flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ backgroundColor: bgColor }}
          >
            {icon}
          </div>
        </div>
        <p
          className="mt-3 text-[2rem] md:text-[2.2rem] leading-none font-semibold font-[family-name:var(--font-display)] tracking-[-0.04em] tabular-nums"
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
