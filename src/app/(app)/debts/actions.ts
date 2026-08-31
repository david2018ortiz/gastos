"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type DebtActionState = { error: string | null };

export async function createDebt(
  _prevState: DebtActionState,
  formData: FormData,
): Promise<DebtActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const totalAmount = Number(formData.get("totalAmount") ?? "");
  const dueDate = String(formData.get("dueDate") ?? "") || null;
  const householdId = String(formData.get("householdId") ?? "") || null;

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return { error: "El monto total debe ser un número mayor a cero." };
  }

  const { error } = await supabase.from("debts").insert({
    user_id: user.id,
    name,
    total_amount: totalAmount,
    remaining_amount: totalAmount,
    due_date: dueDate,
    household_id: householdId,
  });

  if (error) {
    return { error: "No se pudo crear la deuda." };
  }

  revalidatePath("/debts");
  redirect("/debts");
}

export async function updateDebt(
  _prevState: DebtActionState,
  formData: FormData,
): Promise<DebtActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "") || null;
  const householdId = String(formData.get("householdId") ?? "") || null;

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  const { error } = await supabase
    .from("debts")
    .update({ name, due_date: dueDate, household_id: householdId })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo guardar la deuda." };
  }

  revalidatePath("/debts");
  redirect("/debts");
}

export async function deleteDebt(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("debts").delete().eq("id", id);
  revalidatePath("/debts");
}

export type PaymentActionState = { error: string | null };

export async function addDebtPayment(
  _prevState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const debtId = String(formData.get("debtId") ?? "");
  const amount = Number(formData.get("amount") ?? "");
  const paidAt = String(formData.get("paidAt") ?? "") || undefined;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El monto del abono debe ser mayor a cero." };
  }

  const { data: debt } = await supabase
    .from("debts")
    .select("name, household_id")
    .eq("id", debtId)
    .single();

  if (!debt) {
    return { error: "No se encontró la deuda." };
  }

  // El abono sale de tu saldo disponible, así que también queda como
  // gasto en transacciones.
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type: "expense",
      amount,
      occurred_at: paidAt,
      note: `Abono a deuda: ${debt.name}`,
      household_id: debt.household_id,
    })
    .select("id")
    .single();

  if (transactionError || !transaction) {
    return { error: "No se pudo registrar el abono." };
  }

  const { error } = await supabase.from("debt_payments").insert({
    user_id: user.id,
    debt_id: debtId,
    amount,
    paid_at: paidAt,
    transaction_id: transaction.id,
  });

  if (error) {
    return { error: "No se pudo registrar el abono." };
  }

  revalidatePath("/debts");
  revalidatePath(`/debts/${debtId}`);
  revalidatePath("/dashboard");
  redirect(`/debts/${debtId}`);
}
