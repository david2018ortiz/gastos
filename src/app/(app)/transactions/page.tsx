import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteTransaction } from "./actions";
import { buttonClasses } from "@/components/button-styles";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category: categoryFilter, tag: tagFilter } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("tags").select("id, name").order("name"),
  ]);

  let transactionIdsForTag: string[] | null = null;
  if (tagFilter) {
    const { data: tagLinks } = await supabase
      .from("transaction_tags")
      .select("transaction_id")
      .eq("tag_id", tagFilter);
    transactionIdsForTag = (tagLinks ?? []).map((l) => l.transaction_id);
  }

  let query = supabase
    .from("transactions")
    .select("id, type, amount, occurred_at, note, category_id, categories(name)")
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (categoryFilter) {
    query = query.eq("category_id", categoryFilter);
  }
  if (transactionIdsForTag) {
    query = query.in("id", transactionIdsForTag.length ? transactionIdsForTag : ["-"]);
  }

  const { data: transactions } = await query;

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Transacciones</h1>
          <Link
            href="/transactions/new"
            className={buttonClasses.primaryInline}
          >
            Nueva
          </Link>
        </div>

        <div className="flex gap-4 text-sm">
          <Link href="/categories" className="underline">
            Categorías
          </Link>
          <Link href="/tags" className="underline">
            Etiquetas
          </Link>
        </div>

        <form className="flex gap-2" method="get">
          <select
            name="category"
            defaultValue={categoryFilter ?? ""}
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
            defaultValue={tagFilter ?? ""}
            className="flex-1 rounded-md border px-2 py-1.5 text-sm"
          >
            <option value="">Todas las etiquetas</option>
            {(tags ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Filtrar
          </button>
        </form>

        {!transactions || transactions.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No hay transacciones para mostrar.
          </p>
        ) : (
          <ul className="divide-y">
            {transactions.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {t.categories?.name ?? "Sin categoría"}
                  </p>
                  <p className="text-xs text-ink-muted truncate">
                    {dateFormatter.format(new Date(t.occurred_at + "T00:00:00"))}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={
                      "text-sm font-semibold " +
                      (t.type === "income" ? "text-positive" : "text-negative")
                    }
                  >
                    {t.type === "income" ? "+" : "-"}
                    {currencyFormatter.format(t.amount)}
                  </span>
                  <Link
                    href={`/transactions/${t.id}/edit`}
                    className="text-xs underline"
                  >
                    Editar
                  </Link>
                  <form action={deleteTransaction}>
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      type="submit"
                      className="text-xs text-negative underline"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
