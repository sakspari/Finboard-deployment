import type { Transaction } from "@finboard/shared";
import { computeSummary } from "@/lib/analytics";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PeriodDelta {
  readonly label: string;
  readonly period1Value: number;
  readonly period2Value: number;
  readonly absoluteChange: number;
  readonly percentChange: number; // positive = increase, negative = decrease
  readonly direction: "up" | "down" | "flat";
}

export interface CategoryChange {
  readonly category: string;
  readonly period1Amount: number;
  readonly period2Amount: number;
  readonly percentChange: number;
}

export interface ComparisonResult {
  readonly income: PeriodDelta;
  readonly expenses: PeriodDelta;
  readonly netBalance: PeriodDelta;
  readonly transactionCount: PeriodDelta;
  readonly topCategoryChanges: readonly CategoryChange[];
  readonly period1Label: string;
  readonly period2Label: string;
}

export interface SplitResult {
  readonly period1: readonly Transaction[];
  readonly period2: readonly Transaction[];
  readonly period1Label: string;
  readonly period2Label: string;
}

interface DatePeriod {
  start: string;
  end: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatLabelDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${month}/${day}/${year}`;
}

function buildDelta(label: string, v1: number, v2: number): PeriodDelta {
  const absoluteChange = Math.round((v2 - v1) * 100) / 100;
  const percentChange =
    v1 === 0 ? (v2 === 0 ? 0 : 100) : Math.round(((v2 - v1) / Math.abs(v1)) * 10000) / 100;
  const direction: PeriodDelta["direction"] =
    absoluteChange > 0 ? "up" : absoluteChange < 0 ? "down" : "flat";

  return {
    label,
    period1Value: Math.round(v1 * 100) / 100,
    period2Value: Math.round(v2 * 100) / 100,
    absoluteChange,
    percentChange,
    direction,
  };
}

function getCategoryTotals(transactions: readonly Transaction[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const txn of transactions) {
    if (txn.type === "expense") {
      totals.set(txn.category, (totals.get(txn.category) ?? 0) + Math.abs(txn.amount));
    }
  }
  return totals;
}

// ---------------------------------------------------------------------------
// splitIntoPeriods
// ---------------------------------------------------------------------------

export function splitIntoPeriods(
  transactions: readonly Transaction[],
  mode: "auto" | "custom",
  customP1?: DatePeriod | null,
  customP2?: DatePeriod | null,
): SplitResult {
  if (mode === "custom" && customP1 && customP2) {
    const period1 = transactions.filter(
      (txn) => txn.date >= customP1.start && txn.date <= customP1.end,
    );
    const period2 = transactions.filter(
      (txn) => txn.date >= customP2.start && txn.date <= customP2.end,
    );

    return {
      period1,
      period2,
      period1Label: `${formatLabelDate(customP1.start)} – ${formatLabelDate(customP1.end)}`,
      period2Label: `${formatLabelDate(customP2.start)} – ${formatLabelDate(customP2.end)}`,
    };
  }

  // Auto mode: sort by date, split at the midpoint
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) {
    return { period1: [], period2: [], period1Label: "Period 1", period2Label: "Period 2" };
  }

  const midIndex = Math.ceil(sorted.length / 2);
  const period1 = sorted.slice(0, midIndex);
  const period2 = sorted.slice(midIndex);

  const p1Start = period1[0]!.date;
  const p1End = period1[period1.length - 1]!.date;
  const p2Start = period2.length > 0 ? period2[0]!.date : p1End;
  const p2End = period2.length > 0 ? period2[period2.length - 1]!.date : p1End;

  return {
    period1,
    period2,
    period1Label: `${formatLabelDate(p1Start)} – ${formatLabelDate(p1End)}`,
    period2Label: `${formatLabelDate(p2Start)} – ${formatLabelDate(p2End)}`,
  };
}

// ---------------------------------------------------------------------------
// comparePeriods
// ---------------------------------------------------------------------------

export function comparePeriods(
  period1Txns: readonly Transaction[],
  period2Txns: readonly Transaction[],
  period1Label: string,
  period2Label: string,
): ComparisonResult {
  const summary1 = computeSummary(period1Txns);
  const summary2 = computeSummary(period2Txns);

  const income1 = summary1?.totalIncome ?? 0;
  const income2 = summary2?.totalIncome ?? 0;
  const expenses1 = summary1?.totalExpenses ?? 0;
  const expenses2 = summary2?.totalExpenses ?? 0;
  const net1 = summary1?.netBalance ?? 0;
  const net2 = summary2?.netBalance ?? 0;
  const count1 = summary1?.transactionCount ?? 0;
  const count2 = summary2?.transactionCount ?? 0;

  // Category-level changes
  const cat1 = getCategoryTotals(period1Txns);
  const cat2 = getCategoryTotals(period2Txns);

  const allCategories = new Set([...cat1.keys(), ...cat2.keys()]);
  const topCategoryChanges: CategoryChange[] = [];

  for (const category of allCategories) {
    const p1Amount = Math.round((cat1.get(category) ?? 0) * 100) / 100;
    const p2Amount = Math.round((cat2.get(category) ?? 0) * 100) / 100;
    const percentChange =
      p1Amount === 0 ? (p2Amount === 0 ? 0 : 100) : Math.round(((p2Amount - p1Amount) / p1Amount) * 10000) / 100;

    topCategoryChanges.push({ category, period1Amount: p1Amount, period2Amount: p2Amount, percentChange });
  }

  // Sort by absolute percent change descending
  topCategoryChanges.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));

  return {
    income: buildDelta("Income", income1, income2),
    expenses: buildDelta("Expenses", expenses1, expenses2),
    netBalance: buildDelta("Net Balance", net1, net2),
    transactionCount: buildDelta("Transactions", count1, count2),
    topCategoryChanges,
    period1Label,
    period2Label,
  };
}
