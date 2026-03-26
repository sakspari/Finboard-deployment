"use client";

import { useMemo } from "react";
import { useComparisonStore } from "@/store/comparisonStore";
import { useCorrectedTransactions } from "@/hooks/useFilteredData";
import { splitIntoPeriods, comparePeriods } from "@/lib/comparisonAnalytics";
import type { ComparisonResult } from "@/lib/comparisonAnalytics";
import type { Transaction } from "@finboard/shared";

interface ComparisonData {
  readonly isComparing: boolean;
  readonly comparison: ComparisonResult | null;
  readonly period1Label: string;
  readonly period2Label: string;
  readonly period1Transactions: readonly Transaction[];
  readonly period2Transactions: readonly Transaction[];
}

export function useComparisonData(): ComparisonData {
  const isComparing = useComparisonStore((s) => s.isComparing);
  const mode = useComparisonStore((s) => s.mode);
  const customPeriod1 = useComparisonStore((s) => s.customPeriod1);
  const customPeriod2 = useComparisonStore((s) => s.customPeriod2);
  const transactions = useCorrectedTransactions();

  return useMemo(() => {
    if (!isComparing || transactions.length === 0) {
      return {
        isComparing,
        comparison: null,
        period1Label: "",
        period2Label: "",
        period1Transactions: [],
        period2Transactions: [],
      };
    }

    const split = splitIntoPeriods(transactions, mode, customPeriod1, customPeriod2);
    const comparison = comparePeriods(
      split.period1,
      split.period2,
      split.period1Label,
      split.period2Label,
    );

    return {
      isComparing,
      comparison,
      period1Label: split.period1Label,
      period2Label: split.period2Label,
      period1Transactions: split.period1,
      period2Transactions: split.period2,
    };
  }, [isComparing, mode, customPeriod1, customPeriod2, transactions]);
}
