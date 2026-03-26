"use client";

import React from "react";
import { motion } from "motion/react";
import { LayoutGrid, PieChart, BarChart3, Activity } from "lucide-react";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

export type ChartLayoutId =
  | "default"
  | "pie-area"
  | "pie-radar"
  | "area-radar"
  | "all-three"
  | "minimal";

export interface ChartLayout {
  id: ChartLayoutId;
  label: string;
  description: string;
  charts: ("pie" | "area" | "radar")[];
}

export const CHART_LAYOUTS: ChartLayout[] = [
  { id: "default", label: "Overview", description: "Pie + Area + Radar", charts: ["pie", "area", "radar"] },
  { id: "pie-area", label: "Spending Focus", description: "Pie + Area", charts: ["pie", "area"] },
  { id: "pie-radar", label: "Category Deep Dive", description: "Pie + Radar", charts: ["pie", "radar"] },
  { id: "area-radar", label: "Trends & Shape", description: "Area + Radar", charts: ["area", "radar"] },
  { id: "all-three", label: "Full Analysis", description: "All charts", charts: ["pie", "area", "radar"] },
  { id: "minimal", label: "Minimal", description: "Area only", charts: ["area"] },
];

// ---------------------------------------------------------------------------
// Miniature layout thumbnails (abstract representations)
// ---------------------------------------------------------------------------

/** Tiny colored rectangles that represent each chart type in a layout pill. */
const CHART_COLORS: Record<"pie" | "area" | "radar", string> = {
  pie: "var(--color-chart-1)",
  area: "var(--color-income)",
  radar: "var(--color-chart-4)",
};

function LayoutThumbnail({ charts }: { charts: ("pie" | "area" | "radar")[] }) {
  const count = charts.length;

  if (count === 1) {
    return (
      <div className="flex h-5 w-8 items-center justify-center gap-px">
        <div
          className="h-full w-full rounded-[3px]"
          style={{ backgroundColor: CHART_COLORS[charts[0]!], opacity: 0.7 }}
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="flex h-5 w-8 items-center gap-px">
        <div
          className="h-full flex-1 rounded-l-[3px]"
          style={{ backgroundColor: CHART_COLORS[charts[0]!], opacity: 0.7 }}
        />
        <div
          className="h-full flex-1 rounded-r-[3px]"
          style={{ backgroundColor: CHART_COLORS[charts[1]!], opacity: 0.7 }}
        />
      </div>
    );
  }

  // 3 charts — show as 2-column grid with the third spanning bottom
  return (
    <div className="grid h-5 w-8 grid-cols-2 grid-rows-2 gap-px">
      <div
        className="rounded-tl-[3px]"
        style={{ backgroundColor: CHART_COLORS[charts[0]!], opacity: 0.7 }}
      />
      <div
        className="rounded-tr-[3px]"
        style={{ backgroundColor: CHART_COLORS[charts[1]!], opacity: 0.7 }}
      />
      <div
        className="col-span-2 rounded-b-[3px]"
        style={{ backgroundColor: CHART_COLORS[charts[2]!], opacity: 0.7 }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icon for each layout preset
// ---------------------------------------------------------------------------

function LayoutIcon({ id }: { id: ChartLayoutId }) {
  const cls = "h-3.5 w-3.5 shrink-0";
  switch (id) {
    case "default":
      return <LayoutGrid className={cls} />;
    case "pie-area":
    case "pie-radar":
      return <PieChart className={cls} />;
    case "area-radar":
      return <Activity className={cls} />;
    case "all-three":
      return <BarChart3 className={cls} />;
    case "minimal":
      return <Activity className={cls} />;
    default:
      return <LayoutGrid className={cls} />;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ChartLayoutSwitcherProps {
  activeLayout: ChartLayoutId;
  onLayoutChange: (layout: ChartLayoutId) => void;
}

export const ChartLayoutSwitcher = React.memo(function ChartLayoutSwitcher({
  activeLayout,
  onLayoutChange,
}: ChartLayoutSwitcherProps) {
  return (
    <div className="glass-panel-soft rounded-[20px] px-2 py-1.5 inline-flex items-center gap-1.5 overflow-x-auto">
      {CHART_LAYOUTS.map((layout) => {
        const isActive = layout.id === activeLayout;

        return (
          <motion.button
            key={layout.id}
            onClick={() => onLayoutChange(layout.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className={`
              relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium
              uppercase tracking-[0.14em] transition-colors select-none whitespace-nowrap
              ${
                isActive
                  ? "border border-balance bg-balance-bg/40 text-balance"
                  : "border border-transparent text-text-secondary hover:text-text-primary"
              }
            `}
            aria-pressed={isActive}
            title={layout.description}
          >
            {/* Animated active indicator behind content */}
            {isActive && (
              <motion.span
                layoutId="chart-layout-active"
                className="absolute inset-0 rounded-lg border border-balance/30 bg-balance-bg/20"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-2">
              <LayoutIcon id={layout.id} />
              <LayoutThumbnail charts={layout.charts} />
              <span className="hidden sm:inline">{layout.label}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
});
