"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AccountActionState = { error: string | null };

export async function createAccount(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const iconType = String(formData.get("iconType") ?? "bank");
  const color = String(formData.get("color") ?? "#72e3ad");
  const householdId = String(formData.get("householdId") ?? "") || null;

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    name,
    icon_type: iconType,
    color,
    household_id: householdId,
  });

  if (error) {
    return {
      error: error.code === "23505"
        ? "Ya tienes una cuenta con ese nombre."
        : "No se pudo crear la cuenta.",
    };
  }

  revalidatePath("/accounts");
  return { error: null };
}

export async function renameAccount(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const iconType = String(formData.get("iconType") ?? "bank");
  const color = String(formData.get("color") ?? "#72e3ad");

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  const { error } = await supabase
    .from("accounts")
    .update({ name, icon_type: iconType, color })
    .eq("id", id);

  if (error) {
    return {
      error: error.code === "23505"
        ? "Ya tienes una cuenta con ese nombre."
        : "No se pudo guardar la cuenta.",
    };
  }

  revalidatePath("/accounts");
  return { error: null };
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("accounts").delete().eq("id", id);
  revalidatePath("/accounts");
}
