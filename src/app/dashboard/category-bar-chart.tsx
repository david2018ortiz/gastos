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

export function CategoryBarChart({ data }: { data: CategoryBarDatum[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (data.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Sin gastos registrados en este período.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.total));

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-2 pt-6 px-1 snap-x snap-mandatory [scrollbar-width:thin]"
      role="group"
      aria-label="Gasto por categoría"
    >
      {data.map((d) => {
        const color = colorForId(d.id);
        const heightPct = max > 0 ? Math.max((d.total / max) * 100, 4) : 0;

        return (
          <div
            key={d.id}
            className="flex flex-col items-center gap-2 shrink-0 snap-start"
            style={{ width: 56 }}
          >
            <span className="text-xs font-medium text-neutral-700 tabular-nums">
              {currencyFormatter.format(d.total)}
            </span>

            <div className="relative flex h-32 w-10 items-end justify-center">
              <div
                className="w-10 rounded-t-[4px] transition-[height] duration-700 ease-out"
                style={{
                  height: mounted ? `${heightPct}%` : "0%",
                  backgroundColor: color,
                }}
              />
            </div>

            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
              style={{ backgroundColor: color + "26" }}
            >
              {d.icon ?? "🏷️"}
            </span>

            <span className="max-w-[64px] truncate text-center text-xs text-neutral-600">
              {d.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
