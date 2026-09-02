"use client";

import { useEffect, useState } from "react";
import { CategoryBarChart, type CategoryBarDatum } from "./category-bar-chart";
import { FilterBar } from "@/components/filter-bar";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

type Option = { id: string; name: string };

// Scroll a partir del cual se colapsa, y por debajo del cual se vuelve a
// expandir. La brecha entre ambos evita oscilaciones en el borde.
const COLLAPSE_AT = 72;
const EXPAND_AT = 40;
// Cuánto se encoge la sección al colapsar (barras + título ocultos).
// Se usa para no colapsar cuando eso dejaría la página sin scroll.
const COLLAPSE_SHRINK = 130;

export function IncomeExpenseSection({
  totalIncome,
  totalExpense,
  incomeData,
  expenseData,
  categories,
  tags,
  accounts = [],
}: {
  totalIncome: number;
  totalExpense: number;
  incomeData: CategoryBarDatum[];
  expenseData: CategoryBarDatum[];
  categories: Option[];
  tags: Option[];
  accounts?: Option[];
}) {
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [collapsed, setCollapsed] = useState(false);

  // Umbral fijo y simple: a los 72px de scroll, colapsa; por debajo de
  // 40px, se expande de nuevo. La brecha entre los dos evita que oscile
  // justo en el borde. Deliberadamente NO depende de medir la posición
  // de ningún elemento (eso fue la causa de los intentos anteriores
  // fallidos) — solo mira cuánto se ha scrolleado la página.
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      // Con una lista corta, colapsar acorta tanto la página que el
      // scroll se pierde, la sección se expande y vuelve a haber scroll:
      // un bucle visible como parpadeo (se notaba sobre todo en la PWA
      // instalada). Solo colapsamos si, incluso después de encoger, sigue
      // quedando página suficiente para sostener el scroll.
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const hasRoomToCollapse = maxScroll > COLLAPSE_AT + COLLAPSE_SHRINK;

      setCollapsed((prev) => {
        if (!prev && y > COLLAPSE_AT && hasRoomToCollapse) return true;
        if (prev && y < EXPAND_AT) return false;
        return prev;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div className="flex h-9 gap-0.5 rounded-full bg-surface-raised p-0.5">
        <button
          type="button"
          onClick={() => setTab("income")}
          className={
            "flex flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-colors " +
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
            "flex flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-colors " +
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

      <div
        className="sticky top-0 z-10 -mx-5 space-y-2 bg-page px-5 transition-[padding] duration-300"
        style={{
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
          <FilterBar categories={categories} tags={tags} accounts={accounts} />
        </div>
      </div>
    </>
  );
}
