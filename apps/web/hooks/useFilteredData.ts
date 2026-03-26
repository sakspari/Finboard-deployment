"use client";

import { useMemo } from "react";
import { useTransactionStore } from "@/store/transactionStore";
import { useFilterStore } from "@/store/filterStore";
import { computeSummary, computeInsights, getCategoryBreakdown } from "@/lib/analytics";
import type { Transaction, Summary, Insights } from "@finboard/shared";

export function useFilteredTransactions(): readonly Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useFilterStore((s) => s.categories);
  const searchQuery = useFilterStore((s) => s.searchQuery);

  return useMemo(() => {
    const categorySet = new Set(categories);
    const hasCategories = categorySet.size > 0;
    const hasSearch = searchQuery.length > 0;
    const lowerQuery = searchQuery.toLowerCase();

    if (!hasCategories && !hasSearch) return transactions;

    return transactions.filter((txn) => {
      if (hasCategories && !categorySet.has(txn.category)) return false;
      if (hasSearch && !txn.description.toLowerCase().includes(lowerQuery)) return false;
      return true;
    });
  }, [transactions, categories, searchQuery]);
}

export function useFilteredSummary(): Summary | null {
  const filtered = useFilteredTransactions();
  return useMemo(() => computeSummary(filtered), [filtered]);
}

export function useFilteredInsights(): Insights {
  const filtered = useFilteredTransactions();
  return useMemo(() => computeInsights(filtered), [filtered]);
}

export function useFilteredCategoryBreakdown() {
  const filtered = useFilteredTransactions();
  return useMemo(() => getCategoryBreakdown(filtered), [filtered]);
}
