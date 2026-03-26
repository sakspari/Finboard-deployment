"use client";

import { useTransactionStore } from "@/store/transactionStore";

export function Header() {
  const status = useTransactionStore((s) => s.status);
  const reset = useTransactionStore((s) => s.reset);
  const hasData = status === "success";

  return (
    <header className="bg-surface-inverse text-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between h-14">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
          Finboard
        </h1>
        {hasData && (
          <button
            onClick={reset}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Upload new file
          </button>
        )}
      </div>
      <div className="h-px bg-[#C4A35A]" />
    </header>
  );
}
