"use client";

import { useRouter } from "next/navigation";

export type Period = "day" | "week" | "month" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  day: "Día",
  week: "Semana",
  month: "Mes",
  year: "Año",
};

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function step(anchor: Date, period: Period, direction: 1 | -1): Date {
  if (period === "day") return addDays(anchor, direction);
  if (period === "week") return addDays(anchor, direction * 7);
  if (period === "month") return addMonths(anchor, direction);
  return addYears(anchor, direction);
}

export function formatPeriodLabel(anchor: Date, period: Period): string {
  if (period === "day") {
    return new Intl.DateTimeFormat("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(anchor);
  }
  if (period === "week") {
    const day = anchor.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const start = addDays(anchor, mondayOffset);
    const end = addDays(start, 6);
    const fmt = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" });
    return `${fmt.format(start)} – ${fmt.format(end)}`;
  }
  if (period === "month") {
    return new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(
      anchor,
    );
  }
  return String(anchor.getFullYear());
}

export function PeriodNav({
  anchor,
  period,
  extraParams,
}: {
  anchor: Date;
  period: Period;
  extraParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const prev = step(anchor, period, -1);
  const next = step(anchor, period, 1);

  function buildHref(date: Date, p: Period) {
    const params = new URLSearchParams();
    params.set("period", p);
    params.set("date", toISODate(date));
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) params.set(key, value);
    }
    return `/dashboard?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between gap-1.5">
      <button
        type="button"
        onClick={() => router.push(buildHref(prev, period))}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-xs"
        aria-label="Período anterior"
      >
        ←
      </button>

      <span className="min-w-0 flex-1 truncate text-center text-xs font-medium capitalize text-ink-secondary">
        {formatPeriodLabel(anchor, period)}
      </span>

      <div className="relative shrink-0">
        <select
          aria-label="Tipo de período"
          value={period}
          onChange={(e) => router.push(buildHref(anchor, e.target.value as Period))}
          className="h-7 cursor-pointer appearance-none rounded-md border border-border bg-surface pl-2 pr-5 text-[11px] font-medium text-ink-secondary"
        >
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <option key={p} value={p}>
              {PERIOD_LABELS[p]}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-ink-muted"
          aria-hidden="true"
        >
          ▾
        </span>
      </div>

      <button
        type="button"
        onClick={() => router.push(buildHref(next, period))}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-xs"
        aria-label="Período siguiente"
      >
        →
      </button>
    </div>
  );
}
