"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { GitCompare } from "lucide-react";
import { useComparisonStore } from "@/store/comparisonStore";

export const ComparisonToggle = React.memo(function ComparisonToggle() {
  const isComparing = useComparisonStore((s) => s.isComparing);
  const toggleComparison = useComparisonStore((s) => s.toggleComparison);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={toggleComparison}
      className={`
        glass-button relative flex items-center gap-2 rounded-full px-3 py-2 text-sm
        font-medium transition-all duration-200
        ${
          isComparing
            ? "border-balance bg-balance-bg/60 text-balance shadow-[0_0_12px_rgba(74,125,255,0.15)]"
            : "text-text-secondary"
        }
      `}
      aria-pressed={isComparing}
      aria-label={isComparing ? "Disable comparison" : "Enable comparison"}
    >
      <span className="relative">
        <GitCompare size={16} strokeWidth={2} />
        <AnimatePresence>
          {isComparing && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-balance shadow-[0_0_6px_rgba(74,125,255,0.4)]"
            />
          )}
        </AnimatePresence>
      </span>
      <span className="hidden sm:inline">Compare</span>
    </motion.button>
  );
});
