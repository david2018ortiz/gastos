"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type TransactionActionState = { error: string | null };

function parseTagNames(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    ),
  );
}

export async function createTransaction(
  _prevState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const type = String(formData.get("type") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");
  const occurredAt = String(formData.get("occurredAt") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const tagsRaw = String(formData.get("tags") ?? "");

  if (type !== "income" && type !== "expense") {
    return { error: "Tipo de transacción inválido." };
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El monto debe ser un número mayor a cero." };
  }

  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type,
      amount,
      occurred_at: occurredAt || undefined,
      category_id: categoryId,
      note,
    })
    .select("id")
    .single();

  if (transactionError || !transaction) {
    return { error: "No se pudo guardar la transacción." };
  }

  const tagNames = parseTagNames(tagsRaw);
  if (tagNames.length > 0) {
    const { data: existingTags } = await supabase
      .from("tags")
      .select("id, name")
      .in("name", tagNames);

    const existingNames = new Set(existingTags?.map((t) => t.name) ?? []);
    const newTagNames = tagNames.filter((name) => !existingNames.has(name));

    let allTags = existingTags ?? [];
    if (newTagNames.length > 0) {
      const { data: insertedTags, error: tagsError } = await supabase
        .from("tags")
        .insert(newTagNames.map((name) => ({ user_id: user.id, name })))
        .select("id, name");

      if (tagsError) {
        return { error: "La transacción se guardó, pero no se pudieron crear las etiquetas." };
      }
      allTags = allTags.concat(insertedTags ?? []);
    }

    const { error: linkError } = await supabase.from("transaction_tags").insert(
      allTags.map((tag) => ({
        transaction_id: transaction.id,
        tag_id: tag.id,
        user_id: user.id,
      })),
    );

    if (linkError) {
      return { error: "La transacción se guardó, pero no se pudieron vincular las etiquetas." };
    }
  }

  revalidatePath("/transactions");
  redirect("/transactions");
}

export type QuickAddState = { error: string | null; success: boolean };

// Variante para el botón de "agregar rápido" del resumen: guarda sin salir
// de la página (a diferencia de createTransaction, que redirige a
// /transactions). Pensada para registrar un gasto en un par de toques.
export async function quickAddTransaction(
  _prevState: QuickAddState,
  formData: FormData,
): Promise<QuickAddState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión.", success: false };
  }

  const type = String(formData.get("type") ?? "expense");
  const amount = Number(formData.get("amount") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (type !== "income" && type !== "expense") {
    return { error: "Tipo de transacción inválido.", success: false };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El monto debe ser un número mayor a cero.", success: false };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type,
    amount,
    category_id: categoryId,
    note,
  });

  if (error) {
    return { error: "No se pudo guardar la transacción.", success: false };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { error: null, success: true };
}

export async function updateTransaction(
  _prevState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const id = String(formData.get("id") ?? "");
  const type = String(formData.get("type") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");
  const occurredAt = String(formData.get("occurredAt") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const tagsRaw = String(formData.get("tags") ?? "");

  if (type !== "income" && type !== "expense") {
    return { error: "Tipo de transacción inválido." };
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El monto debe ser un número mayor a cero." };
  }

  const { error: transactionError } = await supabase
    .from("transactions")
    .update({
      type,
      amount,
      occurred_at: occurredAt || undefined,
      category_id: categoryId,
      note,
    })
    .eq("id", id);

  if (transactionError) {
    return { error: "No se pudo guardar la transacción." };
  }

  const { error: unlinkError } = await supabase
    .from("transaction_tags")
    .delete()
    .eq("transaction_id", id);

  if (unlinkError) {
    return { error: "La transacción se guardó, pero no se pudieron actualizar las etiquetas." };
  }

  const tagNames = parseTagNames(tagsRaw);
  if (tagNames.length > 0) {
    const { data: existingTags } = await supabase
      .from("tags")
      .select("id, name")
      .in("name", tagNames);

    const existingNames = new Set(existingTags?.map((t) => t.name) ?? []);
    const newTagNames = tagNames.filter((name) => !existingNames.has(name));

    let allTags = existingTags ?? [];
    if (newTagNames.length > 0) {
      const { data: insertedTags, error: tagsError } = await supabase
        .from("tags")
        .insert(newTagNames.map((name) => ({ user_id: user.id, name })))
        .select("id, name");

      if (tagsError) {
        return { error: "La transacción se guardó, pero no se pudieron crear las etiquetas." };
      }
      allTags = allTags.concat(insertedTags ?? []);
    }

    const { error: linkError } = await supabase.from("transaction_tags").insert(
      allTags.map((tag) => ({
        transaction_id: id,
        tag_id: tag.id,
        user_id: user.id,
      })),
    );

    if (linkError) {
      return { error: "La transacción se guardó, pero no se pudieron vincular las etiquetas." };
    }
  }

  revalidatePath("/transactions");
  redirect("/transactions");
}

// Usada desde la lista (deslizar para eliminar): se queda en la misma
// página, solo revalida los datos.
export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("transactions").delete().eq("id", id);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

// Usada desde la pantalla de edición: ahí sí tiene sentido volver al
// listado después de borrar, porque no queda nada que editar.
export async function deleteTransactionAndRedirect(formData: FormData) {
  await deleteTransaction(formData);
  redirect("/transactions");
}
