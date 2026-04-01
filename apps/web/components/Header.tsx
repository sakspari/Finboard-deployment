"use client";

import { motion } from "motion/react";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryCorrectionStore } from "@/store/categoryCorrectionStore";
import { ComparisonToggle } from "./ComparisonToggle";
import { Eraser } from "lucide-react";

export function Header() {
  const status = useTransactionStore((s) => s.status);
  const reset = useTransactionStore((s) => s.reset);
  const correctionCount = useCategoryCorrectionStore((s) => s.correctionCount());
  const clearCorrections = useCategoryCorrectionStore((s) => s.clearCorrections);
  const hasData = status === "success";

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 px-4 md:px-8 pt-4 md:pt-6"
    >
      <div className="glass-shell max-w-[1320px] mx-auto flex items-center justify-between rounded-[28px] px-5 md:px-7 h-16 text-slate-100">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[1.35rem] md:text-[1.65rem] font-semibold tracking-[-0.045em]">
            Finboard
          </h1>
          <p className="text-[10px] md:text-[11px] text-slate-400 tracking-[0.24em] uppercase font-medium">
            Finance CSV Visualizer
          </p>
        </div>
        {hasData && (
          <div className="flex items-center gap-2">
            <ComparisonToggle />
            {correctionCount > 0 && (
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={clearCorrections}
                className="glass-button rounded-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 transition-all flex items-center gap-1.5"
                title="Clear all category corrections"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {correctionCount} correction{correctionCount !== 1 ? "s" : ""}
                </span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              onClick={reset}
              className="glass-button rounded-full px-4 py-2 text-sm font-medium text-slate-100 transition-all"
            >
              Upload new file
            </motion.button>
          </div>
        )}
      </div>
    </motion.header>
  );
}
