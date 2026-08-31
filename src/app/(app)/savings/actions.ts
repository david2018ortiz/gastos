"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SavingsGoalActionState = { error: string | null };

export async function createSavingsGoal(
  _prevState: SavingsGoalActionState,
  formData: FormData,
): Promise<SavingsGoalActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const targetAmount = Number(formData.get("targetAmount") ?? "");
  const targetDate = String(formData.get("targetDate") ?? "") || null;
  const householdId = String(formData.get("householdId") ?? "") || null;

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    return { error: "La meta debe ser un número mayor a cero." };
  }

  const { error } = await supabase.from("savings_goals").insert({
    user_id: user.id,
    name,
    target_amount: targetAmount,
    target_date: targetDate,
    household_id: householdId,
  });

  if (error) {
    return { error: "No se pudo crear la meta de ahorro." };
  }

  revalidatePath("/savings");
  redirect("/savings");
}

export async function updateSavingsGoal(
  _prevState: SavingsGoalActionState,
  formData: FormData,
): Promise<SavingsGoalActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const targetDate = String(formData.get("targetDate") ?? "") || null;
  const householdId = String(formData.get("householdId") ?? "") || null;

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  const { error } = await supabase
    .from("savings_goals")
    .update({ name, target_date: targetDate, household_id: householdId })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo guardar la meta de ahorro." };
  }

  revalidatePath("/savings");
  redirect("/savings");
}

export async function deleteSavingsGoal(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("savings_goals").delete().eq("id", id);
  revalidatePath("/savings");
}

export type ContributionActionState = { error: string | null };

export async function addSavingsContribution(
  _prevState: ContributionActionState,
  formData: FormData,
): Promise<ContributionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const savingsGoalId = String(formData.get("savingsGoalId") ?? "");
  const amount = Number(formData.get("amount") ?? "");
  const contributedAt = String(formData.get("contributedAt") ?? "") || undefined;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El aporte debe ser mayor a cero." };
  }

  const { data: goal } = await supabase
    .from("savings_goals")
    .select("name, household_id")
    .eq("id", savingsGoalId)
    .single();

  if (!goal) {
    return { error: "No se encontró la meta de ahorro." };
  }

  // El aporte sale de tu saldo disponible, así que también queda como
  // gasto en transacciones (dinero que pasa de "libre" a "guardado").
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type: "expense",
      amount,
      occurred_at: contributedAt,
      note: `Aporte a meta de ahorro: ${goal.name}`,
      household_id: goal.household_id,
    })
    .select("id")
    .single();

  if (transactionError || !transaction) {
    return { error: "No se pudo registrar el aporte." };
  }

  const { error } = await supabase.from("savings_contributions").insert({
    user_id: user.id,
    savings_goal_id: savingsGoalId,
    amount,
    contributed_at: contributedAt,
    transaction_id: transaction.id,
  });

  if (error) {
    return { error: "No se pudo registrar el aporte." };
  }

  revalidatePath("/savings");
  revalidatePath(`/savings/${savingsGoalId}`);
  revalidatePath("/dashboard");
  redirect(`/savings/${savingsGoalId}`);
}
