"use client";

import { useEffect, useRef, useState } from "react";
import { CategoryBarChart, type CategoryBarDatum } from "./category-bar-chart";
import { FilterBar } from "@/components/filter-bar";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// Ya no hay una barra superior fija en el layout (app), así que el bloque
// sticky de aquí se pega directo contra el borde superior del viewport.
const HEADER_OFFSET = 0;

type Option = { id: string; name: string };

export function IncomeExpenseSection({
  totalIncome,
  totalExpense,
  incomeData,
  expenseData,
  categories,
  tags,
}: {
  totalIncome: number;
  totalExpense: number;
  incomeData: CategoryBarDatum[];
  expenseData: CategoryBarDatum[];
  categories: Option[];
  tags: Option[];
}) {
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [collapsed, setCollapsed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      { rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-center">
          <button
            type="button"
            onClick={() => setTab("income")}
            className={
              "rounded-lg border p-3 text-center transition-colors " +
              (tab === "income" ? "border-positive bg-positive/10" : "border-border")
            }
            aria-pressed={tab === "income"}
          >
            <p className="text-xs text-ink-muted">Ingresos</p>
            <p className="text-sm font-semibold text-positive tabular-nums">
              {currencyFormatter.format(totalIncome)}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setTab("expense")}
            className={
              "rounded-lg border p-3 text-center transition-colors " +
              (tab === "expense" ? "border-negative bg-negative/10" : "border-border")
            }
            aria-pressed={tab === "expense"}
          >
            <p className="text-xs text-ink-muted">Gastos</p>
            <p className="text-sm font-semibold text-negative tabular-nums">
              {currencyFormatter.format(totalExpense)}
            </p>
          </button>
        </div>
      </section>

      <div ref={sentinelRef} aria-hidden="true" />

      <div
        className="sticky z-10 -mx-6 space-y-2 bg-page px-6 transition-[padding] duration-300"
        style={{
          top: HEADER_OFFSET,
          paddingTop: collapsed ? 6 : 12,
          paddingBottom: collapsed ? 6 : 12,
        }}
      >
        {!collapsed && (
          <h2 className="text-sm font-medium text-ink-secondary">
            {tab === "expense" ? "Gasto por categoría" : "Ingreso por categoría"}
          </h2>
        )}
        <CategoryBarChart
          data={tab === "expense" ? expenseData : incomeData}
          collapsed={collapsed}
        />
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-secondary">
            Movimientos del período
          </h2>
          <FilterBar categories={categories} tags={tags} />
        </div>
      </div>
    </>
  );
}
