import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PeriodNav, type Period } from "./period-nav";
import { CategoryBarChart, type CategoryBarDatum } from "./category-bar-chart";
import { TagChips, type TagChipDatum } from "./tag-chips";
import { QuickAddTransaction } from "@/components/quick-add-transaction";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dateRange(anchor: Date, period: Period): { start: string; end: string } {
  if (period === "day") {
    return { start: toISODate(anchor), end: toISODate(addDays(anchor, 1)) };
  }
  if (period === "week") {
    const day = anchor.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const start = addDays(anchor, mondayOffset);
    return { start: toISODate(start), end: toISODate(addDays(start, 7)) };
  }
  if (period === "month") {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
    return { start: toISODate(start), end: toISODate(end) };
  }
  const start = new Date(anchor.getFullYear(), 0, 1);
  const end = new Date(anchor.getFullYear() + 1, 0, 1);
  return { start: toISODate(start), end: toISODate(end) };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    date?: string;
    category?: string;
    tag?: string;
  }>;
}) {
  const params = await searchParams;
  const period: Period =
    params.period === "day" || params.period === "week" || params.period === "year"
      ? params.period
      : "month";

  const anchor = params.date ? new Date(params.date + "T00:00:00") : new Date();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { start, end } = dateRange(anchor, period);

  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("id, name, icon, type").order("name"),
    supabase.from("tags").select("id, name").order("name"),
  ]);

  let transactionIdsForTag: string[] | null = null;
  if (params.tag) {
    const { data: tagLinks } = await supabase
      .from("transaction_tags")
      .select("transaction_id")
      .eq("tag_id", params.tag);
    transactionIdsForTag = (tagLinks ?? []).map((l) => l.transaction_id);
  }

  let query = supabase
    .from("transactions")
    .select(
      "id, type, amount, category_id, categories(id, name, icon), transaction_tags(tags(id, name))",
    )
    .gte("occurred_at", start)
    .lt("occurred_at", end);

  if (params.category) {
    query = query.eq("category_id", params.category);
  }
  if (transactionIdsForTag) {
    query = query.in("id", transactionIdsForTag.length ? transactionIdsForTag : ["-"]);
  }

  const { data: transactions } = await query;
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

  const extraParams = { category: params.category, tag: params.tag };

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-8">
        <h1 className="text-2xl font-semibold">Resumen</h1>

        <PeriodNav anchor={anchor} period={period} extraParams={extraParams} />

        <form className="flex gap-2" method="get">
          <input type="hidden" name="period" value={period} />
          <input type="hidden" name="date" value={toISODate(anchor)} />
          <select
            name="category"
            defaultValue={params.category ?? ""}
            className="flex-1 rounded-md border px-2 py-1.5 text-sm"
          >
            <option value="">Todas las categorías</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="tag"
            defaultValue={params.tag ?? ""}
            className="flex-1 rounded-md border px-2 py-1.5 text-sm"
          >
            <option value="">Todas las etiquetas</option>
            {(tags ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
            Filtrar
          </button>
        </form>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-ink-muted">Ingresos</p>
            <p className="text-sm font-semibold text-positive tabular-nums">
              {currencyFormatter.format(totalIncome)}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-ink-muted">Gastos</p>
            <p className="text-sm font-semibold text-negative tabular-nums">
              {currencyFormatter.format(totalExpense)}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-ink-muted">Balance</p>
            <p
              className={
                "text-sm font-semibold tabular-nums " +
                (balance >= 0 ? "text-positive" : "text-negative")
              }
            >
              {currencyFormatter.format(balance)}
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-ink-secondary">
            Gasto por categoría
          </h2>
          <CategoryBarChart data={categoryData} />
        </section>

        {tagData.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-ink-secondary">
              Etiquetas del período
            </h2>
            <TagChips tags={tagData} />
          </section>
        )}
      </div>

      <QuickAddTransaction categories={categories ?? []} />
    </main>
  );
}
