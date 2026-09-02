"use client";

import { useEffect, useState } from "react";

export type MonthlyDatum = {
  key: string; // "2026-08"
  label: string; // "Ago"
  income: number;
  expense: number;
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
  notation: "compact",
});

export function MonthlyBarChart({ data }: { data: MonthlyDatum[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2" role="group" aria-label="Ingresos y gastos por mes">
        {data.map((d) => {
          const incomePct = (d.income / max) * 100;
          const expensePct = (d.expense / max) * 100;
          return (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-28 items-end gap-1">
                <div
                  className="w-3 rounded-t-[3px] bg-positive transition-[height] duration-700 ease-out"
                  style={{ height: mounted ? `${Math.max(incomePct, d.income > 0 ? 3 : 0)}%` : "0%" }}
                  aria-hidden="true"
                />
                <div
                  className="w-3 rounded-t-[3px] bg-negative transition-[height] duration-700 ease-out"
                  style={{ height: mounted ? `${Math.max(expensePct, d.expense > 0 ? 3 : 0)}%` : "0%" }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-[11px] font-medium capitalize text-ink-secondary">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-positive" /> Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-negative" /> Gastos
        </span>
      </div>

      <p className="sr-only">
        {data
          .map((d) => `${d.label}: ingresos ${currencyFormatter.format(d.income)}, gastos ${currencyFormatter.format(d.expense)}`)
          .join(". ")}
      </p>
    </div>
  );
}
