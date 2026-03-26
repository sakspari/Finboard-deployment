"use client";

import { create } from "zustand";
import type { Category } from "@finboard/shared";

interface FilterState {
  categories: Category[];
  searchQuery: string;
}

interface FilterActions {
  toggleCategory: (category: Category) => void;
  setCategories: (categories: Category[]) => void;
  setSearchQuery: (query: string) => void;
  clearAll: () => void;
  hasActiveFilters: () => boolean;
  activeFilterCount: () => number;
}

type FilterStore = FilterState & FilterActions;

const initialFilterState: FilterState = {
  categories: [],
  searchQuery: "",
};

export const useFilterStore = create<FilterStore>()((set, get) => ({
  ...initialFilterState,

  toggleCategory: (category) =>
    set((state) => ({
      categories: state.categories.includes(category)
        ? state.categories.filter((c) => c !== category)
        : [...state.categories, category],
    })),

  setCategories: (categories) => set({ categories }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  clearAll: () => set(initialFilterState),

  hasActiveFilters: () => {
    const state = get();
    return state.categories.length > 0 || state.searchQuery !== "";
  },

  activeFilterCount: () => {
    const state = get();
    let count = 0;
    if (state.categories.length > 0) count++;
    if (state.searchQuery.length > 0) count++;
    return count;
  },
}));
