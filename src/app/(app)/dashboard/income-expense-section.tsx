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
  // Posición del sentinel en el documento, medida UNA sola vez al montar
  // (antes de que el colapso pueda cambiar la altura de nada). Usar esto
  // en vez de un IntersectionObserver evita el bucle de retroalimentación:
  // si se vuelve a medir después de colapsar, el punto de referencia se
  // mueve, dispara el estado contrario, y así sin parar (el parpadeo).
  const anchorTopRef = useRef(0);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    anchorTopRef.current = sentinel.getBoundingClientRect().top + window.scrollY;

    // Zona muerta entre el punto de colapsar y el de expandir de nuevo,
    // para que un scroll de 1px justo en el límite no oscile sin parar.
    const COLLAPSE_AT = 24;
    const EXPAND_AT = 4;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const distance = window.scrollY - anchorTopRef.current;
        setCollapsed((prev) => {
          if (!prev && distance > COLLAPSE_AT) return true;
          if (prev && distance < EXPAND_AT) return false;
          return prev;
        });
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
