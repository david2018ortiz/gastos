import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonClasses } from "@/components/button-styles";
import { FilterBar } from "@/components/filter-bar";
import { SearchBox } from "@/components/search-box";
import { TransactionList } from "@/components/transaction-list";
import { PageTitleBar } from "@/components/page-title-bar";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; account?: string; q?: string }>;
}) {
  const { category: categoryFilter, tag: tagFilter, account: accountFilter, q } =
    await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: categories }, { data: tags }, { data: accounts }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("tags").select("id, name").order("name"),
    supabase.from("accounts").select("id, name").order("name"),
  ]);

  let transactionIdsForTag: string[] | null = null;
  if (tagFilter) {
    const { data: tagLinks } = await supabase
      .from("transaction_tags")
      .select("transaction_id")
      .eq("tag_id", tagFilter);
    transactionIdsForTag = (tagLinks ?? []).map((l) => l.transaction_id);
  }

  // La búsqueda coincide con la descripción, o con el nombre de la
  // categoría o cuenta de la transacción.
  let searchOrFilter: string | null = null;
  if (q) {
    // PostgREST usa comas y paréntesis como sintaxis del filtro .or(): se
    // quitan del término de búsqueda para no romper la consulta.
    const safeQ = q.replace(/[,()]/g, " ").trim();
    const [{ data: matchingCategories }, { data: matchingAccounts }] = await Promise.all([
      supabase.from("categories").select("id").ilike("name", `%${safeQ}%`),
      supabase.from("accounts").select("id").ilike("name", `%${safeQ}%`),
    ]);
    const clauses = [`note.ilike.%${safeQ}%`];
    if (matchingCategories && matchingCategories.length > 0) {
      clauses.push(`category_id.in.(${matchingCategories.map((c) => c.id).join(",")})`);
    }
    if (matchingAccounts && matchingAccounts.length > 0) {
      clauses.push(`account_id.in.(${matchingAccounts.map((a) => a.id).join(",")})`);
    }
    searchOrFilter = clauses.join(",");
  }

  let query = supabase
    .from("transactions")
    .select(
      "id, type, amount, occurred_at, note, category_id, household_id, categories(name, icon), accounts(name, icon_type, color)",
    )
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (categoryFilter) {
    query = query.eq("category_id", categoryFilter);
  }
  if (accountFilter) {
    query = query.eq("account_id", accountFilter);
  }
  if (transactionIdsForTag) {
    query = query.in("id", transactionIdsForTag.length ? transactionIdsForTag : ["-"]);
  }
  if (searchOrFilter) {
    query = query.or(searchOrFilter);
  }

  const { data: transactions } = await query;

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <PageTitleBar
          title="Transacciones"
          userId={user.id}
          action={
            <Link href="/transactions/new" className={buttonClasses.primaryInline}>
              Nueva
            </Link>
          }
        />

        <SearchBox placeholder="Buscar por descripción, categoría o cuenta…" />

        <div className="flex items-center justify-end">
          <FilterBar categories={categories ?? []} tags={tags ?? []} accounts={accounts ?? []} />
        </div>

        <TransactionList
          transactions={transactions ?? []}
          emptyMessage="No hay transacciones para mostrar."
        />
      </div>
    </main>
  );
}
