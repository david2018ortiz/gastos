"use client";

import { useEffect, useState } from "react";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function SavingsProgress({
  targetAmount,
  currentAmount,
}: {
  targetAmount: number;
  currentAmount: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const pct =
    targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>{currencyFormatter.format(currentAmount)} ahorrado</span>
        <span className="tabular-nums">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
          style={{ width: mounted ? `${pct}%` : "0%" }}
        />
      </div>
      <p className="text-xs text-ink-muted">
        Meta: {currencyFormatter.format(targetAmount)}
      </p>
    </div>
  );
}
