import Link from "next/link";

const monthFormatter = new Intl.DateTimeFormat("es-CO", {
  month: "long",
  year: "numeric",
});

export function PeriodNav({ month }: { month: string }) {
  const [year, m] = month.split("-").map(Number);
  const current = new Date(year, m - 1, 1);

  const prev = new Date(year, m - 2, 1);
  const next = new Date(year, m, 1);

  const format = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const label = monthFormatter.format(current);

  return (
    <div className="flex items-center justify-between">
      <Link
        href={`/dashboard?month=${format(prev)}`}
        className="rounded-md border px-2 py-1 text-sm"
        aria-label="Mes anterior"
      >
        ←
      </Link>
      <span className="text-sm font-medium capitalize">{label}</span>
      <Link
        href={`/dashboard?month=${format(next)}`}
        className="rounded-md border px-2 py-1 text-sm"
        aria-label="Mes siguiente"
      >
        →
      </Link>
    </div>
  );
}
