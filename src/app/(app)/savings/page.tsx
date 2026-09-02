import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SavingsProgress } from "./savings-progress";
import { deleteSavingsGoal } from "./actions";
import { buttonClasses } from "@/components/button-styles";
import { PageTitleBar } from "@/components/page-title-bar";

export default async function SavingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: goals } = await supabase
    .from("savings_goals")
    .select("*")
    .order("target_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <PageTitleBar
          title="Ahorro"
          userId={user.id}
          action={
            <Link href="/savings/new" className={buttonClasses.primaryInline}>
              Nueva meta
            </Link>
          }
        />

        {!goals || goals.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Todavía no tienes metas de ahorro.
          </p>
        ) : (
          <ul className="space-y-4">
            {goals.map((goal) => (
              <li key={goal.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Link href={`/savings/${goal.id}`} className="font-medium">
                    {goal.name}
                    {goal.household_id && (
                      <span className="ml-1 text-xs" title="Meta compartida con tu familia">
                        🏠
                      </span>
                    )}
                  </Link>
                  <div className="flex items-center gap-3 text-xs">
                    <Link href={`/savings/${goal.id}/edit`} className="underline">
                      Editar
                    </Link>
                    <form action={deleteSavingsGoal}>
                      <input type="hidden" name="id" value={goal.id} />
                      <button type="submit" className="text-negative underline">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>

                <SavingsProgress
                  targetAmount={goal.target_amount}
                  currentAmount={goal.current_amount}
                />

                {goal.target_date && (
                  <p className="text-xs text-ink-muted">
                    Plazo: {goal.target_date}
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
