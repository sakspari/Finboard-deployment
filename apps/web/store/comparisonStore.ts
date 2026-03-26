"use client";

import { create } from "zustand";

interface DatePeriod {
  start: string;
  end: string;
}

interface ComparisonState {
  isComparing: boolean;
  mode: "auto" | "custom";
  customPeriod1: DatePeriod | null;
  customPeriod2: DatePeriod | null;
}

interface ComparisonActions {
  toggleComparison: () => void;
  setMode: (mode: "auto" | "custom") => void;
  setCustomPeriods: (p1: DatePeriod, p2: DatePeriod) => void;
  resetComparison: () => void;
}

type ComparisonStore = ComparisonState & ComparisonActions;

const initialState: ComparisonState = {
  isComparing: false,
  mode: "auto",
  customPeriod1: null,
  customPeriod2: null,
};

export const useComparisonStore = create<ComparisonStore>()((set) => ({
  ...initialState,

  toggleComparison: () =>
    set((state) => ({ isComparing: !state.isComparing })),

  setMode: (mode) => set({ mode }),

  setCustomPeriods: (p1, p2) =>
    set({ customPeriod1: p1, customPeriod2: p2 }),

  resetComparison: () => set(initialState),
}));
