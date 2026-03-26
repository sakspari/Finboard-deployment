"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Search, X, Check } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import { useTransactionStore } from "@/store/transactionStore";
import { CATEGORIES } from "@finboard/shared";
import type { Category } from "@finboard/shared";

export const FilterBar = React.memo(function FilterBar() {
  const categories = useFilterStore((s) => s.categories);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const toggleCategory = useFilterStore((s) => s.toggleCategory);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);
  const clearAll = useFilterStore((s) => s.clearAll);
  const activeCount = useFilterStore((s) => {
    let count = 0;
    if (s.categories.length > 0) count++;
    if (s.searchQuery.length > 0) count++;
    return count;
  });
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showCategories, setShowCategories] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cancel debounce on new upload
  const uploadStatus = useTransactionStore((s) => s.status);
  useEffect(() => {
    if (uploadStatus === "loading") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    }
  }, [uploadStatus]);

  // Sync local search with store (for clear all)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setSearchQuery(value), 300);
  }, [setSearchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCategories(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Get unique categories from data
  const transactions = useTransactionStore((s) => s.transactions);
  const availableCategories = React.useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return CATEGORIES.filter((c) => cats.has(c));
  }, [transactions]);

  return (
    <div className="sticky top-0 z-10 backdrop-blur-sm bg-surface-primary/80 -mx-4 md:-mx-8 px-4 md:px-8 py-3 border-b border-border">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full rounded-lg bg-surface-secondary pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-focus/20 transition-shadow"
          />
        </div>

        {/* Category filter */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
              categories.length > 0
                ? "border-balance bg-balance-bg text-balance"
                : "border-border text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            Categories
            {categories.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-balance text-[10px] text-white font-medium">
                {categories.length}
              </span>
            )}
          </button>

          {showCategories && (
            <div className="absolute top-full left-0 mt-1 w-56 rounded-lg border border-border bg-surface-primary shadow-lg z-20">
              <div className="max-h-64 overflow-y-auto p-1">
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-text-primary hover:bg-surface-secondary transition-colors"
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                      categories.includes(cat) ? "bg-balance border-balance" : "border-border"
                    }`}>
                      {categories.includes(cat) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear filters */}
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface-secondary transition-colors"
          >
            <X className="h-3 w-3" />
            Clear filters ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
});
