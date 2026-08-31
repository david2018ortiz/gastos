"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TagActionState = { error: string | null };

export async function createTag(
  _prevState: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const householdId = String(formData.get("householdId") ?? "") || null;
  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  const { error } = await supabase
    .from("tags")
    .insert({ user_id: user.id, name, household_id: householdId });

  if (error) {
    return {
      error: error.code === "23505"
        ? "Ya tienes una etiqueta con ese nombre."
        : "No se pudo crear la etiqueta.",
    };
  }

  revalidatePath("/tags");
  return { error: null };
}

export async function deleteTag(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("tags").delete().eq("id", id);
  revalidatePath("/tags");
}
