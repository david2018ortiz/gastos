"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type TransactionActionState = { error: string | null };

const emptyState: TransactionActionState = { error: null };

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

export { emptyState as transactionActionInitialState };
