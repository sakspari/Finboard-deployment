"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Check, X } from "lucide-react";
import { CATEGORIES } from "@finboard/shared";
import type { Transaction, Category } from "@finboard/shared";
import { useCategoryCorrectionStore } from "@/store/categoryCorrectionStore";
import { useTransactionStore } from "@/store/transactionStore";

interface CategoryEditModalProps {
  transaction: Transaction;
  position: { top: number; left: number };
  onClose: () => void;
}

export const CategoryEditModal = React.memo(function CategoryEditModal({
  transaction,
  position,
  onClose,
}: CategoryEditModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [applyToSimilar, setApplyToSimilar] = React.useState(true);
  const correctCategory = useCategoryCorrectionStore((s) => s.correctCategory);
  const transactions = useTransactionStore((s) => s.transactions);

  const correctedCategory = useCategoryCorrectionStore((s) =>
    s.getCorrectedCategory(transaction.description),
  );
  const currentCategory = correctedCategory ?? transaction.category;

  const handleSelect = useCallback(
    (category: Category) => {
      if (category === currentCategory) {
        onClose();
        return;
      }
      correctCategory(transaction.id, category, applyToSimilar, transactions);
      onClose();
    },
    [correctCategory, transaction.id, applyToSimilar, transactions, currentCategory, onClose],
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.92, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -4 }}
        transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed z-[9999] w-[260px] rounded-[22px] border border-slate-700 bg-slate-800 p-3 shadow-2xl"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Header */}
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-100">
            Category
          </span>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Category list */}
        <div className="max-h-[280px] overflow-y-auto scrollbar-thin">
          {CATEGORIES.map((category) => {
            const isSelected = category === currentCategory;
            return (
              <button
                key={category}
                onClick={() => handleSelect(category)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-slate-700 font-medium text-slate-100"
                    : "text-slate-400 hover:bg-slate-700 hover:text-slate-100"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-balance bg-balance text-white"
                      : "border-slate-600 bg-slate-700/50"
                  }`}
                >
                  {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                <span className="truncate">{category}</span>
              </button>
            );
          })}
        </div>

        {/* Apply to similar checkbox */}
        <div className="mt-2 border-t border-slate-700 pt-2 px-1 rounded-lg bg-slate-700/50 p-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={applyToSimilar}
              onChange={(e) => setApplyToSimilar(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-600 accent-balance"
            />
            <span>Apply to similar transactions</span>
          </label>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
});
