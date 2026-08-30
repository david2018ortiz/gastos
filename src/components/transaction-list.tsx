"use client";

import { useEffect, useState } from "react";
import { deleteTransaction } from "@/app/(app)/transactions/actions";
import { SwipeableRow } from "./swipeable-row";
import { colorForId } from "@/lib/chart-colors";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const dayFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

export type TransactionRow = {
  id: string;
  type: string;
  amount: number;
  occurred_at: string;
  note: string | null;
  categories: { name: string; icon: string | null } | null;
};

function groupByDate(transactions: TransactionRow[]) {
  const groups = new Map<string, TransactionRow[]>();
  for (const t of transactions) {
    const list = groups.get(t.occurred_at) ?? [];
    list.push(t);
    groups.set(t.occurred_at, list);
  }
  return Array.from(groups.entries());
}

export function TransactionList({
  transactions,
  emptyMessage = "No hay movimientos en este período todavía.",
}: {
  transactions: TransactionRow[];
  emptyMessage?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (transactions.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyMessage}</p>;
  }

  const groups = groupByDate(transactions);
  let rowIndex = 0;

  return (
    <div className="space-y-7">
      {groups.map(([date, items]) => (
        <div key={date}>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            {dayFormatter.format(new Date(date + "T00:00:00"))}
          </p>
          <ul>
            {items.map((t) => {
              const delay = rowIndex * 40;
              rowIndex += 1;
              const label = t.categories?.name ?? "Sin categoría";
              const accent = colorForId(label);
              return (
                <li
                  key={t.id}
                  className="border-b border-border/60 transition-all duration-300 ease-out last:border-b-0"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(6px)",
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  <SwipeableRow
                    editHref={`/transactions/${t.id}/edit`}
                    deleteAction={deleteTransaction}
                    deleteId={t.id}
                  >
                    <div className="flex w-full items-center gap-3 py-3.5">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                        style={{ backgroundColor: accent + "1f" }}
                        aria-hidden="true"
                      >
                        {t.categories?.icon ?? "🏷️"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] leading-tight">
                          {label}
                        </p>
                        {t.note && (
                          <p className="truncate text-xs leading-tight text-ink-muted">
                            {t.note}
                          </p>
                        )}
                      </div>
                      <span
                        className={
                          "shrink-0 text-[15px] font-semibold tabular-nums " +
                          (t.type === "income" ? "text-positive" : "text-ink")
                        }
                      >
                        {t.type === "income" ? "+" : "−"}
                        {currencyFormatter.format(t.amount)}
                      </span>
                    </div>
                  </SwipeableRow>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
