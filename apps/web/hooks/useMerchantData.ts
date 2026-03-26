"use client";

import { useMemo } from "react";
import { useFilteredTransactions, useCorrectedTransactions } from "@/hooks/useFilteredData";
import {
  getMerchantGroups,
  detectRecurringTransactions,
  getTopMerchants,
} from "@/lib/merchantAnalytics";
import type { MerchantGroup, RecurringItem } from "@/lib/merchantAnalytics";

/**
 * Returns merchant groups computed from the currently filtered transactions.
 */
export function useMerchantGroups(): MerchantGroup[] {
  const filtered = useFilteredTransactions();
  return useMemo(() => getMerchantGroups(filtered), [filtered]);
}

/**
 * Returns detected recurring transactions from the FULL dataset
 * (not filtered) since recurring detection needs the complete history.
 */
export function useRecurringTransactions(): RecurringItem[] {
  const allTransactions = useCorrectedTransactions();
  return useMemo(
    () => detectRecurringTransactions(allTransactions),
    [allTransactions]
  );
}

/**
 * Returns top N merchants by spend from the currently filtered transactions.
 */
export function useTopMerchants(limit?: number): MerchantGroup[] {
  const filtered = useFilteredTransactions();
  return useMemo(
    () => getTopMerchants(filtered, limit),
    [filtered, limit]
  );
}
