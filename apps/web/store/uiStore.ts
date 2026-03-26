"use client";

import { create } from "zustand";
import type { ChartLayoutId } from "@/components/ChartLayoutSwitcher";

interface UIState {
  searchOpen: boolean;
  isDemoSeeded: boolean;
  lastInteraction: number | null;
  chartLayout: ChartLayoutId;
  setSearchOpen: (open: boolean) => void;
  markDemoSeeded: () => void;
  touch: () => void;
  setChartLayout: (layout: ChartLayoutId) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  isDemoSeeded: false,
  lastInteraction: null,
  chartLayout: "default",
  setSearchOpen: (open) => set({ searchOpen: open }),
  markDemoSeeded: () => set({ isDemoSeeded: true }),
  touch: () => set({ lastInteraction: Date.now() }),
  setChartLayout: (layout) => set({ chartLayout: layout }),
}));
