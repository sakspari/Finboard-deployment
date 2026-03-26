"use client";

import { useMemo } from "react";
import { useTransactionStore } from "@/store/transactionStore";
import { useFilterStore } from "@/store/filterStore";
import { useCategoryCorrectionStore, normalizeDescription } from "@/store/categoryCorrectionStore";
import { computeSummary, computeInsights, getCategoryBreakdown } from "@/lib/analytics";
import type { Transaction, Summary, Insights, Category } from "@finboard/shared";

/**
 * Apply category corrections to transactions, returning new transaction objects
 * for any that have been corrected.
 */
function applyCategoryCorrections(
  transactions: readonly Transaction[],
  corrections: Record<string, Category>,
): readonly Transaction[] {
  if (Object.keys(corrections).length === 0) return transactions;

  return transactions.map((txn) => {
    const normalized = normalizeDescription(txn.description);
    const corrected = corrections[normalized];
    if (corrected && corrected !== txn.category) {
      return { ...txn, category: corrected };
    }
    return txn;
  });
}

export function useCorrectedTransactions(): readonly Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);
  const corrections = useCategoryCorrectionStore((s) => s.corrections);

  return useMemo(
    () => applyCategoryCorrections(transactions, corrections),
    [transactions, corrections],
  );
}

export function useFilteredTransactions(): readonly Transaction[] {
  const transactions = useCorrectedTransactions();
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
