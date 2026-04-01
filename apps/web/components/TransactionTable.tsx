"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useFilteredTransactions } from "@/hooks/useFilteredData";
import { useCategoryCorrectionStore, normalizeDescription } from "@/store/categoryCorrectionStore";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { LIMITS } from "@finboard/shared";
import type { Transaction } from "@finboard/shared";
import { CategoryEditModal } from "./CategoryEditModal";

type SortField = "date" | "description" | "category" | "amount";
type SortDir = "asc" | "desc";

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "bg-[#34D399]/15 text-[#34D399]",
  "Groceries": "bg-[#A78BFA]/15 text-[#A78BFA]",
  "Shopping": "bg-[#FB923C]/15 text-[#FB923C]",
  "Transportation": "bg-[#60A5FA]/15 text-[#60A5FA]",
  "Housing": "bg-[#FBBF24]/15 text-[#FBBF24]",
  "Utilities": "bg-[#F472B6]/15 text-[#F472B6]",
  "Entertainment": "bg-[#2DD4BF]/15 text-[#2DD4BF]",
  "Health": "bg-[#A3E635]/15 text-[#A3E635]",
  "Subscriptions": "bg-[#22D3EE]/15 text-[#22D3EE]",
  "Income": "bg-[#4ADE80]/15 text-[#4ADE80]",
  "Transfer": "bg-[#A1A1AA]/15 text-[#A1A1AA]",
  "Other": "bg-[#D6D3D1]/15 text-[#D6D3D1]",
};

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown className="h-3 w-3 text-slate-400" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3 w-3 text-slate-100" />
    : <ChevronDown className="h-3 w-3 text-slate-100" />;
}

export const TransactionTable = React.memo(function TransactionTable() {
  const transactions = useFilteredTransactions();
  const corrections = useCategoryCorrectionStore((s) => s.corrections);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [editingTxn, setEditingTxn] = useState<{ transaction: Transaction; position: { top: number; left: number } } | null>(null);

  const sorted = useMemo(() => {
    const arr = [...transactions];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date": cmp = a.date.localeCompare(b.date); break;
        case "description": cmp = a.description.localeCompare(b.description); break;
        case "category": cmp = a.category.localeCompare(b.category); break;
        case "amount": cmp = a.amount - b.amount; break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [transactions, sortField, sortDir]);

  const pageSize = LIMITS.PAGE_SIZE;
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  // Reset page when filters change
  React.useEffect(() => { setPage(0); }, [transactions.length]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleCategoryClick = useCallback((e: React.MouseEvent, txn: Transaction) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setEditingTxn({
      transaction: txn,
      position: { top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - 280) },
    });
  }, []);

  const isCorrected = useCallback((txn: Transaction) => {
    const normalized = normalizeDescription(txn.description);
    return normalized in corrections;
  }, [corrections]);

  if (transactions.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-700 bg-slate-900 p-8 text-center text-sm text-slate-400">
        No transactions match your filters
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800">
                {(["date", "description", "category", "amount"] as SortField[]).map((field) => (
                  <th
                    key={field}
                    onClick={() => toggleSort(field)}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-300 cursor-pointer hover:text-slate-100 select-none ${field === "amount" ? "text-right" : ""}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {field}
                      <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              key={`${sortField}-${sortDir}-${page}`}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {paged.map((txn) => (
                <tr key={txn.id} className="border-b border-slate-700/50 last:border-0 bg-slate-900 hover:bg-slate-800 transition-colors">
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(txn.date)}
                  </td>
                  <td className="px-4 py-3 text-slate-100 max-w-[300px] truncate">
                    {txn.description}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => handleCategoryClick(e, txn)}
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium border transition-all cursor-pointer hover:shadow-md hover:scale-[1.03] ${
                        isCorrected(txn)
                          ? "border-balance/40 ring-1 ring-balance/20 " + (CATEGORY_COLORS[txn.category] || "bg-neutral-bg text-neutral")
                          : "border-slate-700 " + (CATEGORY_COLORS[txn.category] || "bg-neutral-bg text-neutral")
                      }`}
                      title="Click to change category"
                    >
                      {txn.category}
                    </button>
                  </td>
                  <td className={`px-4 py-3 text-right font-[family-name:var(--font-mono)] font-medium whitespace-nowrap ${txn.type === "income" ? "text-income" : "text-expense"}`}>
                    {txn.type === "income" ? "+" : "-"}{formatCurrency(txn.amount)}
                  </td>
                </tr>
              ))}
            </motion.tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-700 px-4 py-3 bg-slate-900">
            <span className="text-xs text-slate-400">
              Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingTxn && (
          <CategoryEditModal
            transaction={editingTxn.transaction}
            position={editingTxn.position}
            onClose={() => setEditingTxn(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
});
