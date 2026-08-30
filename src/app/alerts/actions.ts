"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export type AlertActionState = { error: string | null };

export async function createAlert(
  _prevState: AlertActionState,
  formData: FormData,
): Promise<AlertActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const type = String(formData.get("type") ?? "");

  let condition: Json;

  if (type === "category_budget") {
    const categoryId = String(formData.get("categoryId") ?? "");
    const categoryName = String(formData.get("categoryName") ?? "");
    const budgetAmount = Number(formData.get("budgetAmount") ?? "");
    if (!categoryId) return { error: "Elige una categoría." };
    if (!Number.isFinite(budgetAmount) || budgetAmount <= 0) {
      return { error: "El presupuesto debe ser mayor a cero." };
    }
    condition = { category_id: categoryId, category_name: categoryName, budget_amount: budgetAmount };
  } else if (type === "debt_due") {
    const debtId = String(formData.get("debtId") ?? "");
    const debtName = String(formData.get("debtName") ?? "");
    const daysBefore = Number(formData.get("daysBefore") ?? "");
    if (!debtId) return { error: "Elige una deuda." };
    if (!Number.isFinite(daysBefore) || daysBefore < 0) {
      return { error: "Los días de anticipación deben ser 0 o más." };
    }
    condition = { debt_id: debtId, debt_name: debtName, days_before: daysBefore };
  } else if (type === "savings_stalled") {
    const savingsGoalId = String(formData.get("savingsGoalId") ?? "");
    const savingsGoalName = String(formData.get("savingsGoalName") ?? "");
    const daysWithout = Number(formData.get("daysWithoutContribution") ?? "");
    if (!savingsGoalId) return { error: "Elige una meta de ahorro." };
    if (!Number.isFinite(daysWithout) || daysWithout <= 0) {
      return { error: "Los días sin aportes deben ser mayores a cero." };
    }
    condition = {
      savings_goal_id: savingsGoalId,
      savings_goal_name: savingsGoalName,
      days_without_contribution: daysWithout,
    };
  } else {
    return { error: "Tipo de alerta inválido." };
  }

  const { error } = await supabase.from("alerts").insert({
    user_id: user.id,
    type,
    condition,
    status: "active",
  });

  if (error) {
    return { error: "No se pudo crear la alerta." };
  }

  revalidatePath("/alerts");
  redirect("/alerts");
}

export async function deleteAlert(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("alerts").delete().eq("id", id);
  revalidatePath("/alerts");
}

export async function dismissAlert(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("alerts").update({ status: "dismissed" }).eq("id", id);
  revalidatePath("/alerts");
}
