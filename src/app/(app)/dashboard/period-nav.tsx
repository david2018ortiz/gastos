import Link from "next/link";

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
  const prev = step(anchor, period, -1);
  const next = step(anchor, period, 1);

  const buildHref = (date: Date, p: Period) => {
    const params = new URLSearchParams();
    params.set("period", p);
    params.set("date", toISODate(date));
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) params.set(key, value);
    }
    return `/dashboard?${params.toString()}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg bg-surface-raised p-1">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <Link
            key={p}
            href={buildHref(anchor, p)}
            className={
              "flex-1 rounded-md py-1.5 text-center text-xs font-medium transition-colors " +
              (p === period ? "bg-brand text-brand-ink" : "text-ink-secondary hover:bg-surface")
            }
            aria-current={p === period ? "true" : undefined}
          >
            {PERIOD_LABELS[p]}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={buildHref(prev, period)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm"
          aria-label="Período anterior"
        >
          ←
        </Link>
        <span className="text-sm font-medium capitalize">
          {formatPeriodLabel(anchor, period)}
        </span>
        <Link
          href={buildHref(next, period)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm"
          aria-label="Período siguiente"
        >
          →
        </Link>
      </div>
    </div>
  );
}
