import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DebtProgress } from "../debt-progress";
import { PaymentForm } from "./payment-form";

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

export default async function DebtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: debt }, { data: payments }] = await Promise.all([
    supabase.from("debts").select("*").eq("id", id).single(),
    supabase
      .from("debt_payments")
      .select("*")
      .eq("debt_id", id)
      .order("paid_at", { ascending: false }),
  ]);

  if (!debt) {
    notFound();
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{debt.name}</h1>
          <Link href="/debts" className="text-sm underline">
            Volver
          </Link>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-ink-muted">
            Monto total: {currencyFormatter.format(debt.total_amount)}
          </p>
          <DebtProgress
            totalAmount={debt.total_amount}
            remainingAmount={debt.remaining_amount}
          />
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-ink-secondary">
            Registrar abono
          </h2>
          <PaymentForm debtId={debt.id} />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-ink-secondary">
            Historial de abonos
          </h2>
          {!payments || payments.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Todavía no has registrado abonos.
            </p>
          ) : (
            <ul className="divide-y">
              {payments.map((p) => (
                <li key={p.id} className="py-2 flex items-center justify-between">
                  <span className="text-xs text-ink-muted">
                    {dateFormatter.format(new Date(p.paid_at + "T00:00:00"))}
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {currencyFormatter.format(p.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
