"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Transaction, Summary, UploadResponse } from "@finboard/shared";
import { useFilterStore } from "./filterStore";

interface TransactionState {
  transactions: readonly Transaction[];
  summary: Summary | null;
  warnings: readonly string[];
  status: "idle" | "loading" | "success" | "error";
  errorMessage: string | null;
}

interface TransactionActions {
  setUploadResult: (response: UploadResponse) => void;
  setLoading: () => void;
  setError: (message: string) => void;
  reset: () => void;
}

type TransactionStore = TransactionState & TransactionActions;

const initialState: TransactionState = {
  transactions: [],
  summary: null,
  warnings: [],
  status: "idle",
  errorMessage: null,
};

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      ...initialState,

      setUploadResult: (response) => {
        set({
          transactions: response.transactions,
          summary: response.summary,
          warnings: response.warnings,
          status: "success",
          errorMessage: null,
        });
        // Atomically reset filters on new data
        useFilterStore.getState().clearAll();
      },

      setLoading: () => set({ status: "loading", errorMessage: null }),

      setError: (message) => set({ status: "error", errorMessage: message }),

      reset: () => {
        set(initialState);
        useFilterStore.getState().clearAll();
      },
    }),
    {
      name: "finboard-transactions",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        summary: state.summary,
        warnings: state.warnings,
        status: state.status,
      }),
    }
  )
);
