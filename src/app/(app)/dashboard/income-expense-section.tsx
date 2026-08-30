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
  // Centinela de altura fija colocado justo ANTES del bloque sticky: como
  // está antes en el flujo normal del documento, que el bloque sticky
  // cambie de alto (al colapsar) no mueve al centinela — así que observar
  // su visibilidad con IntersectionObserver es seguro y no entra en bucle.
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="flex h-9 gap-0.5 rounded-md bg-surface-raised p-0.5">
        <button
          type="button"
          onClick={() => setTab("income")}
          className={
            "flex flex-1 items-center justify-center gap-1.5 rounded text-xs font-medium transition-colors " +
            (tab === "income" ? "bg-surface text-ink shadow-sm" : "text-ink-muted")
          }
          aria-pressed={tab === "income"}
        >
          Ingresos
          <span className="tabular-nums text-positive">
            {currencyFormatter.format(totalIncome)}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("expense")}
          className={
            "flex flex-1 items-center justify-center gap-1.5 rounded text-xs font-medium transition-colors " +
            (tab === "expense" ? "bg-surface text-ink shadow-sm" : "text-ink-muted")
          }
          aria-pressed={tab === "expense"}
        >
          Gastos
          <span className="tabular-nums text-negative">
            {currencyFormatter.format(totalExpense)}
          </span>
        </button>
      </div>

      <div ref={sentinelRef} aria-hidden="true" />

      <div
        className="sticky z-10 -mx-5 space-y-2 bg-page px-5 transition-[padding] duration-300"
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
