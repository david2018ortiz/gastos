import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageTitleBar } from "@/components/page-title-bar";
import { todayInBogotaISO } from "@/lib/today";
import { MonthlyBarChart, type MonthlyDatum } from "./monthly-bar-chart";
import { CategoryBarChart, type CategoryBarDatum } from "../dashboard/category-bar-chart";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const MONTHS = 6;

function monthLabel(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("es-CO", { month: "short" }).format(
    new Date(year, monthIndex, 1),
  );
}

function ComparisonCard({
  label,
  current,
  previous,
  goodDirection,
}: {
  label: string;
  current: number;
  previous: number;
  goodDirection: "up" | "down";
}) {
  const delta = current - previous;
  const pct = previous > 0 ? (delta / previous) * 100 : current > 0 ? 100 : 0;
  const rose = delta > 0;
  const isGood = rose ? goodDirection === "up" : goodDirection === "down";
  const showChange = previous > 0 || current > 0;

  return (
    <div className="flex-1 space-y-1 rounded-lg border p-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="text-lg font-semibold tabular-nums">
        {currencyFormatter.format(current)}
      </p>
      {showChange && (
        <p className={"text-xs font-medium " + (isGood ? "text-positive" : "text-negative")}>
          {rose ? "▲" : delta < 0 ? "▼" : "–"} {Math.abs(pct).toFixed(0)}% vs. mes anterior
        </p>
      )}
    </div>
  );
}

export default async function StatisticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const todayISO = todayInBogotaISO();
  const [currentYear, currentMonth] = todayISO.split("-").map(Number);

  // Últimos 6 meses (incluye el actual), más viejo primero.
  const monthKeys: { key: string; year: number; monthIndex: number }[] = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    monthKeys.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
    });
  }

  const rangeStart = `${monthKeys[0].key}-01`;

  const { data: transactions } = await supabase
    .from("transactions")
    .select("type, amount, occurred_at, category_id, categories(id, name, icon)")
    .gte("occurred_at", rangeStart);

  const totalsByMonth = new Map<string, { income: number; expense: number }>();
  for (const { key } of monthKeys) {
    totalsByMonth.set(key, { income: 0, expense: 0 });
  }

  const currentMonthKey = monthKeys[monthKeys.length - 1].key;
  const expenseByCategory = new Map<string, CategoryBarDatum>();

  for (const t of transactions ?? []) {
    const monthKey = t.occurred_at.slice(0, 7);
    const bucket = totalsByMonth.get(monthKey);
    if (!bucket) continue;
    if (t.type === "income") bucket.income += t.amount;
    else bucket.expense += t.amount;

    if (monthKey === currentMonthKey && t.type === "expense") {
      const catKey = t.categories?.id ?? "sin-categoria";
      const existing = expenseByCategory.get(catKey);
      if (existing) {
        existing.total += t.amount;
      } else {
        expenseByCategory.set(catKey, {
          id: catKey,
          name: t.categories?.name ?? "Sin categoría",
          icon: t.categories?.icon ?? null,
          total: t.amount,
        });
      }
    }
  }

  const chartData: MonthlyDatum[] = monthKeys.map(({ key, year, monthIndex }) => ({
    key,
    label: monthLabel(year, monthIndex),
    income: totalsByMonth.get(key)?.income ?? 0,
    expense: totalsByMonth.get(key)?.expense ?? 0,
  }));

  const current = totalsByMonth.get(monthKeys[MONTHS - 1].key) ?? { income: 0, expense: 0 };
  const previous = totalsByMonth.get(monthKeys[MONTHS - 2].key) ?? { income: 0, expense: 0 };

  const expenseCategoryData = Array.from(expenseByCategory.values()).sort(
    (a, b) => b.total - a.total,
  );

  return (
    <main className="flex-1 p-5">
      <div className="mx-auto max-w-sm space-y-5">
        <PageTitleBar title="Estadísticas" userId={user.id} />

        <div className="flex gap-2">
          <ComparisonCard
            label="Gastos este mes"
            current={current.expense}
            previous={previous.expense}
            goodDirection="down"
          />
          <ComparisonCard
            label="Ingresos este mes"
            current={current.income}
            previous={previous.income}
            goodDirection="up"
          />
        </div>

        <section className="space-y-3 rounded-lg border p-3">
          <h2 className="text-sm font-medium text-ink-secondary">
            Últimos {MONTHS} meses
          </h2>
          <MonthlyBarChart data={chartData} />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-ink-secondary">
            Gasto por categoría este mes
          </h2>
          <CategoryBarChart data={expenseCategoryData} />
        </section>

        <Link href="/dashboard" className="block text-sm underline">
          Volver al resumen
        </Link>
      </div>
    </main>
  );
}
