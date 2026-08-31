import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PeriodNav, type Period } from "./period-nav";
import type { CategoryBarDatum } from "./category-bar-chart";
import { IncomeExpenseSection } from "./income-expense-section";
import { TagChips, type TagChipDatum } from "./tag-chips";
import { QuickAddTransaction } from "@/components/quick-add-transaction";
import { TransactionList } from "@/components/transaction-list";
import { PageTitleBar } from "@/components/page-title-bar";
import { getUserHouseholds } from "@/lib/get-user-households";

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

  const [{ data: categories }, { data: tags }, households] = await Promise.all([
    supabase.from("categories").select("id, name, icon, type").order("name"),
    supabase.from("tags").select("id, name").order("name"),
    getUserHouseholds(supabase, user.id),
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
      "id, type, amount, occurred_at, note, category_id, household_id, categories(id, name, icon), transaction_tags(tags(id, name))",
    )
    .gte("occurred_at", start)
    .lt("occurred_at", end)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

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

  function buildCategoryData(type: "expense" | "income"): CategoryBarDatum[] {
    const totals = new Map<string, CategoryBarDatum>();
    for (const t of rows) {
      if (t.type !== type) continue;
      const key = t.categories?.id ?? "sin-categoria";
      const existing = totals.get(key);
      if (existing) {
        existing.total += t.amount;
      } else {
        totals.set(key, {
          id: key,
          name: t.categories?.name ?? "Sin categoría",
          icon: t.categories?.icon ?? null,
          total: t.amount,
        });
      }
    }
    return Array.from(totals.values()).sort((a, b) => b.total - a.total);
  }

  const expenseCategoryData = buildCategoryData("expense");
  const incomeCategoryData = buildCategoryData("income");

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
    <main className="flex-1 p-5">
      <div className="mx-auto max-w-sm space-y-4">
        <PageTitleBar title="Resumen" />

        <PeriodNav anchor={anchor} period={period} extraParams={extraParams} />

        <div className="text-center">
          <p className="text-xs text-ink-muted">Saldo actual</p>
          <p className="text-2xl font-semibold tabular-nums text-ink">
            {currencyFormatter.format(balance)}
          </p>
        </div>

        <IncomeExpenseSection
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          incomeData={incomeCategoryData}
          expenseData={expenseCategoryData}
          categories={categories ?? []}
          tags={tags ?? []}
        />

        <TransactionList transactions={rows} />

        {tagData.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-ink-secondary">
              Etiquetas del período
            </h2>
            <TagChips tags={tagData} />
          </section>
        )}
      </div>

      <QuickAddTransaction
        categories={categories ?? []}
        tags={tags ?? []}
        households={households}
      />
    </main>
  );
}
