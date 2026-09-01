import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "./supabase/database.types";
import { todayInBogotaISO } from "./today";

export type AlertWithMessage = Tables<"alerts"> & { message: string };

type CategoryBudgetCondition = {
  category_id: string;
  category_name: string;
  budget_amount: number;
};

type DebtDueCondition = {
  debt_id: string;
  debt_name: string;
  days_before: number;
};

type SavingsStalledCondition = {
  savings_goal_id: string;
  savings_goal_name: string;
  days_without_contribution: number;
};

function isCategoryBudget(c: unknown): c is CategoryBudgetCondition {
  const o = c as Record<string, unknown>;
  return typeof o?.category_id === "string" && typeof o?.budget_amount === "number";
}

function isDebtDue(c: unknown): c is DebtDueCondition {
  const o = c as Record<string, unknown>;
  return typeof o?.debt_id === "string" && typeof o?.days_before === "number";
}

function isSavingsStalled(c: unknown): c is SavingsStalledCondition {
  const o = c as Record<string, unknown>;
  return (
    typeof o?.savings_goal_id === "string" &&
    typeof o?.days_without_contribution === "number"
  );
}

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/**
 * Evalúa las alertas activas/disparadas del usuario contra el estado actual
 * de sus datos y actualiza `status` cuando corresponde (sin job en segundo
 * plano: se evalúa "en caliente" cada vez que se visita /alerts o el
 * dashboard). Devuelve las que están disparadas ahora mismo, con un mensaje
 * legible.
 */
export async function evaluateAlerts(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AlertWithMessage[]> {
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .in("status", ["active", "triggered"]);

  if (!alerts || alerts.length === 0) return [];

  const now = new Date();
  const monthStart = `${todayInBogotaISO().slice(0, 7)}-01`;

  const [{ data: monthTransactions }, { data: debts }, { data: goals }, { data: contributions }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("amount, category_id")
        .eq("type", "expense")
        .gte("occurred_at", monthStart),
      supabase.from("debts").select("id, due_date, remaining_amount"),
      supabase.from("savings_goals").select("id, target_amount, current_amount, created_at"),
      supabase
        .from("savings_contributions")
        .select("savings_goal_id, contributed_at")
        .order("contributed_at", { ascending: false }),
    ]);

  const spentByCategory = new Map<string, number>();
  for (const t of monthTransactions ?? []) {
    if (!t.category_id) continue;
    spentByCategory.set(t.category_id, (spentByCategory.get(t.category_id) ?? 0) + t.amount);
  }

  const debtById = new Map((debts ?? []).map((d) => [d.id, d]));
  const goalById = new Map((goals ?? []).map((g) => [g.id, g]));

  const lastContributionByGoal = new Map<string, string>();
  for (const c of contributions ?? []) {
    if (!lastContributionByGoal.has(c.savings_goal_id)) {
      lastContributionByGoal.set(c.savings_goal_id, c.contributed_at);
    }
  }

  const triggered: AlertWithMessage[] = [];

  for (const alert of alerts) {
    let isTriggered = false;
    let message = "";

    if (alert.type === "category_budget" && isCategoryBudget(alert.condition)) {
      const spent = spentByCategory.get(alert.condition.category_id) ?? 0;
      isTriggered = spent > alert.condition.budget_amount;
      message = `Gastaste ${currencyFormatter.format(spent)} en "${alert.condition.category_name}" este mes, superando el presupuesto de ${currencyFormatter.format(alert.condition.budget_amount)}.`;
    } else if (alert.type === "debt_due" && isDebtDue(alert.condition)) {
      const debt = debtById.get(alert.condition.debt_id);
      if (debt?.due_date && debt.remaining_amount > 0) {
        const dueDate = new Date(debt.due_date + "T00:00:00");
        const daysLeft = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        isTriggered = daysLeft <= alert.condition.days_before;
        message =
          daysLeft >= 0
            ? `La deuda "${alert.condition.debt_name}" vence en ${daysLeft} día(s).`
            : `La deuda "${alert.condition.debt_name}" está vencida.`;
      }
    } else if (alert.type === "savings_stalled" && isSavingsStalled(alert.condition)) {
      const goal = goalById.get(alert.condition.savings_goal_id);
      if (goal && goal.current_amount < goal.target_amount) {
        const lastDate =
          lastContributionByGoal.get(alert.condition.savings_goal_id) ?? goal.created_at;
        const daysSince = Math.floor(
          (now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24),
        );
        isTriggered = daysSince >= alert.condition.days_without_contribution;
        message = `La meta "${alert.condition.savings_goal_name}" lleva ${daysSince} día(s) sin aportes.`;
      }
    }

    const newStatus = isTriggered ? "triggered" : "active";
    if (newStatus !== alert.status) {
      await supabase.from("alerts").update({ status: newStatus }).eq("id", alert.id);
    }

    if (isTriggered) {
      triggered.push({ ...alert, status: newStatus, message });
    }
  }

  return triggered;
}
