"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

type TransactionRow = {
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
    <div className="space-y-5">
      {groups.map(([date, items]) => (
        <div key={date} className="space-y-2">
          <p className="text-xs font-medium capitalize text-ink-muted">
            {dayFormatter.format(new Date(date + "T00:00:00"))}
          </p>
          <ul className="divide-y overflow-hidden rounded-lg border border-border">
            {items.map((t) => {
              const delay = rowIndex * 40;
              rowIndex += 1;
              return (
                <li
                  key={t.id}
                  className="transition-all duration-300 ease-out"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(6px)",
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  <Link
                    href={`/transactions/${t.id}/edit`}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-surface-raised"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-sm"
                        aria-hidden="true"
                      >
                        {t.categories?.icon ?? "🏷️"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {t.categories?.name ?? "Sin categoría"}
                        </p>
                        {t.note && (
                          <p className="truncate text-xs text-ink-muted">
                            {t.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={
                        "shrink-0 text-sm font-semibold tabular-nums " +
                        (t.type === "income" ? "text-positive" : "text-negative")
                      }
                    >
                      {t.type === "income" ? "+" : "-"}
                      {currencyFormatter.format(t.amount)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
