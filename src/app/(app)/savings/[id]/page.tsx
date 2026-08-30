import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SavingsProgress } from "../savings-progress";
import { ContributionForm } from "./contribution-form";

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

export default async function SavingsGoalDetailPage({
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

  const [{ data: goal }, { data: contributions }] = await Promise.all([
    supabase.from("savings_goals").select("*").eq("id", id).single(),
    supabase
      .from("savings_contributions")
      .select("*")
      .eq("savings_goal_id", id)
      .order("contributed_at", { ascending: false }),
  ]);

  if (!goal) {
    notFound();
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{goal.name}</h1>
          <Link href="/savings" className="text-sm underline">
            Volver
          </Link>
        </div>

        <SavingsProgress
          targetAmount={goal.target_amount}
          currentAmount={goal.current_amount}
        />

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-ink-secondary">
            Registrar aporte
          </h2>
          <ContributionForm goalId={goal.id} />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-ink-secondary">
            Historial de aportes
          </h2>
          {!contributions || contributions.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Todavía no has registrado aportes.
            </p>
          ) : (
            <ul className="divide-y">
              {contributions.map((c) => (
                <li key={c.id} className="py-2 flex items-center justify-between">
                  <span className="text-xs text-ink-muted">
                    {dateFormatter.format(new Date(c.contributed_at + "T00:00:00"))}
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {currencyFormatter.format(c.amount)}
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
