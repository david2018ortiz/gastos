import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { evaluateAlerts } from "@/lib/evaluate-alerts";
import { deleteAlert, dismissAlert } from "./actions";
import type { Tables } from "@/lib/supabase/database.types";
import { buttonClasses } from "@/components/button-styles";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function describeRule(alert: Tables<"alerts">): string {
  const c = alert.condition as Record<string, unknown>;
  if (alert.type === "category_budget") {
    return `Avisar si "${c.category_name}" supera ${currencyFormatter.format(Number(c.budget_amount))} al mes.`;
  }
  if (alert.type === "debt_due") {
    return `Avisar si "${c.debt_name}" vence en ${c.days_before} día(s) o menos.`;
  }
  if (alert.type === "savings_stalled") {
    return `Avisar si "${c.savings_goal_name}" lleva ${c.days_without_contribution} día(s) sin aportes.`;
  }
  return "Regla desconocida.";
}

export default async function AlertsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const triggered = await evaluateAlerts(supabase, user.id);

  const { data: allAlerts } = await supabase
    .from("alerts")
    .select("*")
    .neq("status", "dismissed")
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Alertas</h1>
          <Link
            href="/alerts/new"
            className={buttonClasses.primaryInline}
          >
            Nueva
          </Link>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-ink-secondary">
            {triggered.length > 0
              ? `${triggered.length} alerta(s) activa(s)`
              : "Sin alertas activas"}
          </h2>

          {triggered.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Todo tranquilo por ahora.
            </p>
          ) : (
            <ul className="space-y-2">
              {triggered.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3 feedback-enter"
                >
                  <p className="text-sm">{alert.message}</p>
                  <form action={dismissAlert}>
                    <input type="hidden" name="id" value={alert.id} />
                    <button type="submit" className="shrink-0 text-xs underline">
                      Descartar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-ink-secondary">
            Reglas configuradas
          </h2>
          {!allAlerts || allAlerts.length === 0 ? (
            <p className="text-sm text-ink-muted">
              No has creado ninguna alerta todavía.
            </p>
          ) : (
            <ul className="divide-y">
              {allAlerts.map((alert) => (
                <li key={alert.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm">{describeRule(alert)}</p>
                    <p className="text-xs text-ink-muted">
                      {alert.status === "triggered" ? "Disparada" : "En espera"}
                    </p>
                  </div>
                  <form action={deleteAlert}>
                    <input type="hidden" name="id" value={alert.id} />
                    <button type="submit" className="shrink-0 text-xs text-negative underline">
                      Eliminar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link href="/dashboard" className="block text-sm underline">
          Volver al resumen
        </Link>
      </div>
    </main>
  );
}
