"use client";

import { useEffect, useState } from "react";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function DebtProgress({
  totalAmount,
  remainingAmount,
}: {
  totalAmount: number;
  remainingAmount: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const paid = Math.max(totalAmount - remainingAmount, 0);
  const pct = totalAmount > 0 ? Math.min((paid / totalAmount) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{currencyFormatter.format(paid)} pagado</span>
        <span className="tabular-nums">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#cdeecd]">
        <div
          className="h-full rounded-full bg-[#0ca30c] transition-[width] duration-700 ease-out"
          style={{ width: mounted ? `${pct}%` : "0%" }}
        />
      </div>
      <p className="text-xs text-neutral-500">
        Saldo pendiente: {currencyFormatter.format(remainingAmount)}
      </p>
    </div>
  );
}
