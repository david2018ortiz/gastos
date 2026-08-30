import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { evaluateAlerts } from "@/lib/evaluate-alerts";
import { PeriodNav } from "./period-nav";
import { CategoryBarChart, type CategoryBarDatum } from "./category-bar-chart";
import { TagChips, type TagChipDatum } from "./tag-chips";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function monthRange(month: string) {
  const [year, m] = month.split("-").map(Number);
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m, 1);
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  return { start: toISODate(start), end: toISODate(end) };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const now = new Date();
  const month =
    monthParam ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { start, end } = monthRange(month);

  const triggeredAlerts = await evaluateAlerts(supabase, user.id);

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      "id, type, amount, category_id, categories(id, name, icon), transaction_tags(tags(id, name))",
    )
    .gte("occurred_at", start)
    .lt("occurred_at", end);

  const rows = transactions ?? [];

  const totalIncome = rows
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = rows
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const categoryTotals = new Map<string, CategoryBarDatum>();
  for (const t of rows) {
    if (t.type !== "expense") continue;
    const key = t.categories?.id ?? "sin-categoria";
    const existing = categoryTotals.get(key);
    if (existing) {
      existing.total += t.amount;
    } else {
      categoryTotals.set(key, {
        id: key,
        name: t.categories?.name ?? "Sin categoría",
        icon: t.categories?.icon ?? null,
        total: t.amount,
      });
    }
  }
  const categoryData = Array.from(categoryTotals.values()).sort(
    (a, b) => b.total - a.total,
  );

  const tagMap = new Map<string, TagChipDatum>();
  for (const t of rows) {
    for (const link of t.transaction_tags) {
      if (link.tags) {
        tagMap.set(link.tags.id, { id: link.tags.id, name: link.tags.name });
      }
    }
  }
  const tagData = Array.from(tagMap.values());

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Resumen</h1>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/alerts" className="relative underline">
              Alertas
              {triggeredAlerts.length > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d03b3b] px-1 text-[10px] font-semibold text-white">
                  {triggeredAlerts.length}
                </span>
              )}
            </Link>
            <Link href="/transactions" className="underline">
              Transacciones
            </Link>
          </div>
        </div>

        <PeriodNav month={month} />

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-neutral-500">Ingresos</p>
            <p className="text-sm font-semibold text-green-600 tabular-nums">
              {currencyFormatter.format(totalIncome)}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-neutral-500">Gastos</p>
            <p className="text-sm font-semibold text-red-600 tabular-nums">
              {currencyFormatter.format(totalExpense)}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-neutral-500">Balance</p>
            <p
              className={
                "text-sm font-semibold tabular-nums " +
                (balance >= 0 ? "text-green-600" : "text-red-600")
              }
            >
              {currencyFormatter.format(balance)}
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-700">
            Gasto por categoría
          </h2>
          <CategoryBarChart data={categoryData} />
        </section>

        {tagData.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-neutral-700">
              Etiquetas del período
            </h2>
            <TagChips tags={tagData} />
          </section>
        )}
      </div>
    </main>
  );
}
