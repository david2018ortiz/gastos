import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DebtProgress } from "./debt-progress";
import { deleteDebt } from "./actions";
import { buttonClasses } from "@/components/button-styles";

export default async function DebtsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: debts } = await supabase
    .from("debts")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Deudas</h1>
          <Link
            href="/debts/new"
            className={buttonClasses.primaryInline}
          >
            Nueva
          </Link>
        </div>

        {!debts || debts.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Todavía no tienes deudas registradas.
          </p>
        ) : (
          <ul className="space-y-4">
            {debts.map((debt) => (
              <li key={debt.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Link href={`/debts/${debt.id}`} className="font-medium">
                    {debt.name}
                  </Link>
                  <div className="flex items-center gap-3 text-xs">
                    <Link href={`/debts/${debt.id}/edit`} className="underline">
                      Editar
                    </Link>
                    <form action={deleteDebt}>
                      <input type="hidden" name="id" value={debt.id} />
                      <button type="submit" className="text-negative underline">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>

                <DebtProgress
                  totalAmount={debt.total_amount}
                  remainingAmount={debt.remaining_amount}
                />

                {debt.due_date && (
                  <p className="text-xs text-ink-muted">
                    Vence: {debt.due_date}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <Link href="/dashboard" className="block text-sm underline">
          Volver al resumen
        </Link>
      </div>
    </main>
  );
}
