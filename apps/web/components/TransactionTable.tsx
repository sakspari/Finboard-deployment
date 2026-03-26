"use client";

import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useFilteredTransactions } from "@/hooks/useFilteredData";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { LIMITS } from "@finboard/shared";
import type { Transaction } from "@finboard/shared";

type SortField = "date" | "description" | "category" | "amount";
type SortDir = "asc" | "desc";

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "bg-[#2D6A4F]/10 text-[#2D6A4F]",
  "Groceries": "bg-[#6B4C9A]/10 text-[#6B4C9A]",
  "Shopping": "bg-[#C06014]/10 text-[#C06014]",
  "Transportation": "bg-[#1D4E89]/10 text-[#1D4E89]",
  "Housing": "bg-[#92782A]/10 text-[#92782A]",
  "Utilities": "bg-[#B44D6C]/10 text-[#B44D6C]",
  "Entertainment": "bg-[#3B7A8B]/10 text-[#3B7A8B]",
  "Health": "bg-[#5C6B3C]/10 text-[#5C6B3C]",
  "Subscriptions": "bg-[#16653A]/10 text-[#16653A]",
  "Income": "bg-[#16653A]/10 text-[#16653A]",
  "Transfer": "bg-[#78716C]/10 text-[#78716C]",
  "Other": "bg-[#A8A29E]/10 text-[#A8A29E]",
};

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown className="h-3 w-3 text-text-tertiary" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3 w-3 text-text-primary" />
    : <ChevronDown className="h-3 w-3 text-text-primary" />;
}

export const TransactionTable = React.memo(function TransactionTable() {
  const transactions = useFilteredTransactions();
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

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

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-secondary p-8 text-center text-sm text-text-tertiary">
        No transactions match your filters
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-secondary overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {(["date", "description", "category", "amount"] as SortField[]).map((field) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary cursor-pointer hover:text-text-secondary select-none ${field === "amount" ? "text-right" : ""}`}
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
              <tr key={txn.id} className="border-b border-border/50 last:border-0 hover:bg-surface-tertiary/50 transition-colors">
                <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-text-secondary whitespace-nowrap">
                  {formatDate(txn.date)}
                </td>
                <td className="px-4 py-3 text-text-primary max-w-[300px] truncate">
                  {txn.description}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[txn.category] || "bg-neutral-bg text-neutral"}`}>
                    {txn.category}
                  </span>
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
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-text-tertiary">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-xs text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="text-xs text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
