"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Category, Transaction, TransactionId } from "@finboard/shared";

/**
 * Normalize a transaction description for matching:
 * - lowercase
 * - trim
 * - collapse multiple whitespace to single space
 * - strip trailing numbers, dates, and date-like patterns (e.g., "12/15", "#1234")
 */
export function normalizeDescription(description: string): string {
  return description
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\s#]*[\d/.\-]+\s*$/g, "")
    .trim();
}

interface CorrectionState {
  corrections: Record<string, Category>;
}

interface CorrectionActions {
  correctCategory: (
    transactionId: TransactionId,
    newCategory: Category,
    applyToSimilar: boolean,
    transactions: readonly Transaction[],
  ) => void;
  getCorrectedCategory: (description: string) => Category | undefined;
  clearCorrections: () => void;
  correctionCount: () => number;
}

type CorrectionStore = CorrectionState & CorrectionActions;

const initialState: CorrectionState = {
  corrections: {},
};

export const useCategoryCorrectionStore = create<CorrectionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      correctCategory: (transactionId, newCategory, applyToSimilar, transactions) => {
        const transaction = transactions.find((t) => t.id === transactionId);
        if (!transaction) return;

        const normalized = normalizeDescription(transaction.description);

        if (applyToSimilar) {
          // Find all transactions whose normalized description matches and batch-correct them
          const newCorrections: Record<string, Category> = {};
          for (const txn of transactions) {
            if (normalizeDescription(txn.description) === normalized) {
              newCorrections[normalizeDescription(txn.description)] = newCategory;
            }
          }
          // Also set the key for the source transaction's normalized description
          newCorrections[normalized] = newCategory;

          set((state) => ({
            corrections: { ...state.corrections, ...newCorrections },
          }));
        } else {
          set((state) => ({
            corrections: { ...state.corrections, [normalized]: newCategory },
          }));
        }
      },

      getCorrectedCategory: (description) => {
        const normalized = normalizeDescription(description);
        return get().corrections[normalized];
      },

      clearCorrections: () => set(initialState),

      correctionCount: () => Object.keys(get().corrections).length,
    }),
    {
      name: "finboard-corrections",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        corrections: state.corrections,
      }),
    },
  ),
);
