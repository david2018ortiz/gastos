"use client";

import { useState } from "react";
import { CategoryBarChart, type CategoryBarDatum } from "./category-bar-chart";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function IncomeExpenseSection({
  totalIncome,
  totalExpense,
  incomeData,
  expenseData,
}: {
  totalIncome: number;
  totalExpense: number;
  incomeData: CategoryBarDatum[];
  expenseData: CategoryBarDatum[];
}) {
  const [tab, setTab] = useState<"expense" | "income">("expense");

  return (
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

      <h2 className="text-sm font-medium text-ink-secondary">
        {tab === "expense" ? "Gasto por categoría" : "Ingreso por categoría"}
      </h2>
      <CategoryBarChart data={tab === "expense" ? expenseData : incomeData} />
    </section>
  );
}
