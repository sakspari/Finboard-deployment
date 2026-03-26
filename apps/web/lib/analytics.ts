import type { Transaction, Summary, Insights, CategoryBreakdown, BiggestExpense, MonthlyBreakdown, DateString, YearMonth, Category } from "@finboard/shared";

export function computeSummary(transactions: readonly Transaction[]): Summary | null {
  if (transactions.length === 0) return null;

  let totalIncome = 0;
  let totalExpenses = 0;
  let minDate = "9999-99-99";
  let maxDate = "0000-00-00";

  for (const txn of transactions) {
    if (txn.type === "income") {
      totalIncome += txn.amount;
    } else {
      totalExpenses += Math.abs(txn.amount);
    }
    if (txn.date < minDate) minDate = txn.date;
    if (txn.date > maxDate) maxDate = txn.date;
  }

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netBalance: Math.round((totalIncome - totalExpenses) * 100) / 100,
    transactionCount: transactions.length,
    dateRange: { start: minDate as DateString, end: maxDate as DateString },
  };
}

export function computeInsights(transactions: readonly Transaction[]): Insights {
  if (transactions.length === 0) {
    return { topCategory: null, biggestExpense: null, averageDailySpending: 0, monthlyBreakdown: [] };
  }

  // Category breakdown (expenses only)
  const categoryTotals = new Map<string, number>();
  let totalExpenses = 0;
  let biggest: { description: string; amount: number; date: DateString } | null = null;

  for (const txn of transactions) {
    if (txn.type === "expense") {
      const absAmount = Math.abs(txn.amount);
      categoryTotals.set(txn.category, (categoryTotals.get(txn.category) || 0) + absAmount);
      totalExpenses += absAmount;
      if (!biggest || absAmount > Math.abs(biggest.amount)) {
        biggest = { description: txn.description, amount: txn.amount, date: txn.date };
      }
    }
  }

  // Top category
  let topCategory: CategoryBreakdown | null = null;
  let maxAmount = 0;
  for (const [name, amount] of categoryTotals) {
    if (amount > maxAmount) {
      maxAmount = amount;
      topCategory = {
        name: name as Category,
        amount: Math.round(amount * 100) / 100,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      };
    }
  }

  // Average daily spending
  const dates = transactions.filter((t) => t.type === "expense").map((t) => t.date);
  const uniqueDays = new Set(dates).size;
  const averageDailySpending = uniqueDays > 0 ? Math.round((totalExpenses / uniqueDays) * 100) / 100 : 0;

  // Monthly breakdown
  const monthMap = new Map<string, { income: number; expenses: number }>();
  for (const txn of transactions) {
    const month = txn.date.substring(0, 7);
    const entry = monthMap.get(month) || { income: 0, expenses: 0 };
    if (txn.type === "income") {
      entry.income += txn.amount;
    } else {
      entry.expenses += Math.abs(txn.amount);
    }
    monthMap.set(month, entry);
  }

  const monthlyBreakdown: MonthlyBreakdown[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: month as YearMonth,
      income: Math.round(data.income * 100) / 100,
      expenses: Math.round(data.expenses * 100) / 100,
    }));

  return {
    topCategory,
    biggestExpense: biggest as BiggestExpense | null,
    averageDailySpending,
    monthlyBreakdown,
  };
}

export function getCategoryBreakdown(transactions: readonly Transaction[]): { name: string; value: number; color: string }[] {
  const CHART_COLORS: Record<string, string> = {
    "Food & Dining": "#2D6A4F",
    "Groceries": "#6B4C9A",
    "Shopping": "#C06014",
    "Transportation": "#1D4E89",
    "Housing": "#92782A",
    "Utilities": "#B44D6C",
    "Entertainment": "#3B7A8B",
    "Health": "#5C6B3C",
    "Subscriptions": "#16653A",
    "Income": "#8B6B4A",
    "Transfer": "#78716C",
    "Other": "#A8A29E",
  };

  const totals = new Map<string, number>();
  for (const txn of transactions) {
    if (txn.type === "expense") {
      totals.set(txn.category, (totals.get(txn.category) || 0) + Math.abs(txn.amount));
    }
  }

  return Array.from(totals.entries())
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: CHART_COLORS[name] || "#A8A29E",
    }))
    .sort((a, b) => b.value - a.value);
}
