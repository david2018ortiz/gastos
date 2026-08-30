import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, type, amount, occurred_at, note, categories(name)")
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Transacciones</h1>
          <Link
            href="/transactions/new"
            className="rounded-md bg-black text-white px-3 py-1.5 text-sm font-medium"
          >
            Nueva
          </Link>
        </div>

        {!transactions || transactions.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Todavía no has registrado ninguna transacción.
          </p>
        ) : (
          <ul className="divide-y">
            {transactions.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {t.categories?.name ?? "Sin categoría"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {dateFormatter.format(new Date(t.occurred_at + "T00:00:00"))}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <span
                  className={
                    "text-sm font-semibold " +
                    (t.type === "income" ? "text-green-600" : "text-red-600")
                  }
                >
                  {t.type === "income" ? "+" : "-"}
                  {currencyFormatter.format(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
