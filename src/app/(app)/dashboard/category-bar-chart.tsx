"use client";

import { useEffect, useState } from "react";
import { colorForId } from "@/lib/chart-colors";

export type CategoryBarDatum = {
  id: string;
  name: string;
  icon: string | null;
  total: number;
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
  notation: "compact",
});

export function CategoryBarChart({
  data,
  collapsed = false,
}: {
  data: CategoryBarDatum[];
  collapsed?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (data.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Sin gastos registrados en este período.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.total));

  return (
    <div
      className="flex gap-4 overflow-x-auto overflow-y-hidden px-1 [scrollbar-width:thin] snap-x snap-mandatory"
      style={{
        paddingTop: collapsed ? 4 : 8,
        paddingBottom: collapsed ? 4 : 8,
      }}
      role="group"
      aria-label="Gasto por categoría"
    >
      {data.map((d) => {
        const color = colorForId(d.id);
        const heightPct = max > 0 ? Math.max((d.total / max) * 100, 4) : 0;

        return (
          <div
            key={d.id}
            className="flex flex-col items-center shrink-0 snap-start"
            style={{ width: collapsed ? 44 : 56 }}
          >
            <div
              className="relative flex w-10 items-end justify-center overflow-hidden transition-[height] duration-300 ease-out"
              style={{ height: collapsed ? 0 : 96 }}
            >
              <div
                className="w-10 rounded-t-[4px] transition-[height] duration-700 ease-out"
                style={{
                  height: mounted && !collapsed ? `${heightPct}%` : "0%",
                  backgroundColor: color,
                }}
              />
            </div>

            <span className="mt-1 text-xs font-medium text-ink-secondary tabular-nums">
              {currencyFormatter.format(d.total)}
            </span>

            <span
              className="mt-1.5 flex items-center justify-center rounded-full text-sm transition-[height,width] duration-300"
              style={{
                height: collapsed ? 26 : 28,
                width: collapsed ? 26 : 28,
                backgroundColor: color + "26",
              }}
            >
              {d.icon ?? "🏷️"}
            </span>

            <span
              className="max-w-[64px] truncate text-center text-xs text-ink-secondary transition-all duration-300 ease-out"
              style={{
                marginTop: collapsed ? 0 : 6,
                maxHeight: collapsed ? 0 : 16,
                opacity: collapsed ? 0 : 1,
              }}
            >
              {d.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
