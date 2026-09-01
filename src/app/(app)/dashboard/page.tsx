import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PeriodNav, type Period } from "./period-nav";
import type { CategoryBarDatum } from "./category-bar-chart";
import { IncomeExpenseSection } from "./income-expense-section";
import { TagChips, type TagChipDatum } from "./tag-chips";
import { QuickAddTransaction } from "@/components/quick-add-transaction";
import { TransactionList } from "@/components/transaction-list";
import { PageTitleBar } from "@/components/page-title-bar";
import Link from "next/link";
import { getUserHouseholds } from "@/lib/get-user-households";
import { getUserAccounts } from "@/lib/get-user-accounts";

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

  const [{ data: categories }, { data: tags }, households, accounts] = await Promise.all([
    supabase.from("categories").select("id, name, icon, type").order("name"),
    supabase.from("tags").select("id, name").order("name"),
    getUserHouseholds(supabase, user.id),
    getUserAccounts(supabase, user.id),
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
      "id, type, amount, occurred_at, note, category_id, household_id, categories(id, name, icon), accounts(name, icon), transaction_tags(tags(id, name))",
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

  // Saldo de cada cuenta: no depende del período seleccionado, es
  // acumulado (todo lo que ha entrado/salido de esa cuenta desde siempre).
  const { data: accountTransactions } = await supabase
    .from("transactions")
    .select("account_id, type, amount")
    .not("account_id", "is", null);

  const balanceByAccount = new Map<string, number>();
  for (const t of accountTransactions ?? []) {
    if (!t.account_id) continue;
    const delta = t.type === "income" ? t.amount : -t.amount;
    balanceByAccount.set(t.account_id, (balanceByAccount.get(t.account_id) ?? 0) + delta);
  }
  const totalAccountsBalance = Array.from(balanceByAccount.values()).reduce(
    (sum, v) => sum + v,
    0,
  );

  const householdIds = households.map((h) => h.id);
  let recentHouseholdActivity: { count: number; names: string[] } | null = null;
  if (householdIds.length > 0) {
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: recentTx } = await supabase
      .from("transactions")
      .select("user_id")
      .in("household_id", householdIds)
      .neq("user_id", user.id)
      .gte("created_at", since);

    if (recentTx && recentTx.length > 0) {
      const userIds = Array.from(new Set(recentTx.map((t) => t.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      const names = (profiles ?? []).map((p) => p.full_name || "Tu familiar");
      recentHouseholdActivity = { count: recentTx.length, names };
    }
  }

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

        {recentHouseholdActivity && (
          <p className="rounded-lg border border-brand bg-brand-soft px-3 py-2 text-xs text-ink">
            🏠 {recentHouseholdActivity.names.join(" y ")} agregó{" "}
            {recentHouseholdActivity.count === 1
              ? "un movimiento compartido"
              : `${recentHouseholdActivity.count} movimientos compartidos`}{" "}
            en los últimos 2 días.
          </p>
        )}

        {accounts.length > 0 && (
          <section className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-ink-secondary">Cuentas</h2>
              <Link href="/accounts" className="text-xs underline">
                Ver todas
              </Link>
            </div>
            <ul className="space-y-1.5">
              {accounts.map((account) => (
                <li key={account.id} className="flex items-center justify-between text-sm">
                  <span>
                    {account.icon ?? "💳"} {account.name}
                  </span>
                  <span className="tabular-nums font-medium">
                    {currencyFormatter.format(balanceByAccount.get(account.id) ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <PeriodNav anchor={anchor} period={period} extraParams={extraParams} />

        <div className="text-center">
          <p className="text-xs text-ink-muted">Saldo actual</p>
          <p className="text-2xl font-semibold tabular-nums text-ink">
            {currencyFormatter.format(accounts.length > 0 ? totalAccountsBalance : balance)}
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
        accounts={accounts}
      />
    </main>
  );
}
